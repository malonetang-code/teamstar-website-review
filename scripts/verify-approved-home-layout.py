#!/usr/bin/env python3
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4173/teamstar-website-review"
SCREENSHOT_DIR = Path("/tmp/teamstar-approved-home-review-screenshots")
CASES = (
    ("zh-desktop", "/", {"width": 1440, "height": 1000}, "no-preference"),
    ("en-desktop", "/en/", {"width": 1440, "height": 1000}, "no-preference"),
    ("zh-mobile", "/", {"width": 390, "height": 844}, "no-preference"),
    ("en-mobile", "/en/", {"width": 390, "height": 844}, "no-preference"),
    ("zh-reduced-motion", "/", {"width": 1440, "height": 1000}, "reduce"),
)


def check(condition, message, errors):
    if not condition:
        errors.append(message)


def main():
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    errors = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for name, route, viewport, reduced_motion in CASES:
            context = browser.new_context(
                viewport=viewport,
                reduced_motion=reduced_motion,
                device_scale_factor=1,
            )
            page = context.new_page()
            console_errors = []
            failed_requests = []
            page.on(
                "console",
                lambda message: console_errors.append(message.text)
                if message.type == "error"
                else None,
            )
            page.on(
                "requestfailed",
                lambda request: failed_requests.append(
                    f"{request.url}: {request.failure or 'request failed'}"
                ),
            )
            page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
            page.wait_for_timeout(800)
            page.locator(".reference-section").scroll_into_view_if_needed()
            page.wait_for_timeout(400)

            metrics = page.evaluate(
                """
                () => {
                  const rect = (element) => {
                    if (!element) return null;
                    const value = element.getBoundingClientRect();
                    return {
                      x: Math.round(value.x * 10) / 10,
                      y: Math.round(value.y * 10) / 10,
                      width: Math.round(value.width * 10) / 10,
                      height: Math.round(value.height * 10) / 10,
                    };
                  };
                  const video = document.querySelector('[data-home-video]');
                  const partner = document.querySelector('.partner-section');
                  const partnerImage = partner?.querySelector('img');
                  const evidenceImages = Array.from(
                    document.querySelectorAll('.evidence-home-item img')
                  );
                  const track = document.querySelector('.reference-section .logo-wall');
                  const items = Array.from(track?.children || []);
                  const original = items.slice(0, 10);
                  const duplicate = items.slice(10);
                  const sumWidth = (elements) => elements.reduce(
                    (sum, element) => sum + element.getBoundingClientRect().width,
                    0,
                  );
                  const trackStyle = track ? getComputedStyle(track) : null;
                  return {
                    title: document.title,
                    bodyClass: document.body.className,
                    bodyWidth: document.body.scrollWidth,
                    viewportWidth: document.documentElement.clientWidth,
                    inquiryPresent:
                      document.body.textContent.includes('三种询价方式') ||
                      document.body.textContent.includes('Three Ways to Start') ||
                      Boolean(document.querySelector('.rfq-paths')),
                    video: video ? {
                      count: document.querySelectorAll('video').length,
                      display: getComputedStyle(video).display,
                      objectFit: getComputedStyle(video).objectFit,
                      rect: rect(video),
                      source: video.querySelector('source')?.getAttribute('src'),
                      poster: video.getAttribute('poster'),
                      paused: video.paused,
                      readyState: video.readyState,
                    } : null,
                    partner: {
                      rect: rect(partner),
                      imageRect: rect(partnerImage),
                      imageObjectFit: partnerImage ? getComputedStyle(partnerImage).objectFit : null,
                      rfqLinks: partner?.querySelectorAll('a[href*="/rfq/"]').length || 0,
                    },
                    evidence: evidenceImages.map((image) => ({
                      rect: rect(image),
                      objectFit: getComputedStyle(image).objectFit,
                      src: image.getAttribute('src'),
                    })),
                    marquee: {
                      className: track?.className || '',
                      itemCount: items.length,
                      duplicateCount: duplicate.length,
                      hiddenDuplicateCount: duplicate.filter(
                        (item) => item.getAttribute('aria-hidden') === 'true'
                      ).length,
                      animationName: trackStyle?.animationName || '',
                      animationDuration: trackStyle?.animationDuration || '',
                      trackRect: rect(track),
                      originalWidth: Math.round(sumWidth(original) * 10) / 10,
                      duplicateWidth: Math.round(sumWidth(duplicate) * 10) / 10,
                    },
                  };
                }
                """
            )

            screenshot_path = SCREENSHOT_DIR / f"{name}.png"
            page.screenshot(path=str(screenshot_path), full_page=True)

            check(not console_errors, f"{name}: console errors: {console_errors}", errors)
            check(not failed_requests, f"{name}: failed requests: {failed_requests}", errors)
            check(
                metrics["bodyWidth"] == metrics["viewportWidth"],
                f"{name}: horizontal overflow {metrics['bodyWidth']} > {metrics['viewportWidth']}",
                errors,
            )
            check(not metrics["inquiryPresent"], f"{name}: inquiry section is visible", errors)
            check(metrics["video"]["count"] == 1, f"{name}: production video count changed", errors)
            check(
                metrics["video"]["source"].endswith(
                    "home-company-manufacturing-montage-20260730.mp4"
                ),
                f"{name}: production video source changed",
                errors,
            )
            check(metrics["partner"]["rfqLinks"] == 0, f"{name}: partner RFQ CTA added", errors)
            check(len(metrics["evidence"]) == 2, f"{name}: evidence layout changed", errors)

            if reduced_motion == "reduce":
                check(
                    metrics["marquee"]["itemCount"] == 10,
                    f"{name}: reduced motion should keep ten static logos",
                    errors,
                )
                check(
                    metrics["marquee"]["duplicateCount"] == 0,
                    f"{name}: reduced motion duplicated logos",
                    errors,
                )
                check(
                    metrics["marquee"]["animationName"] == "none",
                    f"{name}: reduced motion animation remains active",
                    errors,
                )
            else:
                check(
                    metrics["marquee"]["itemCount"] == 20,
                    f"{name}: marquee does not contain two complete logo groups",
                    errors,
                )
                check(
                    metrics["marquee"]["hiddenDuplicateCount"] == 10,
                    f"{name}: marquee duplicates are exposed to assistive technology",
                    errors,
                )
                check(
                    metrics["marquee"]["animationName"] == "home-logo-marquee",
                    f"{name}: marquee animation is inactive",
                    errors,
                )
                check(
                    abs(
                        metrics["marquee"]["originalWidth"]
                        - metrics["marquee"]["duplicateWidth"]
                    )
                    < 0.5,
                    f"{name}: marquee halves differ and may jump at the loop seam",
                    errors,
                )

            results.append(
                {
                    "case": name,
                    "viewport": viewport,
                    "reducedMotion": reduced_motion,
                    "metrics": metrics,
                    "consoleErrors": console_errors,
                    "failedRequests": failed_requests,
                    "screenshot": str(screenshot_path),
                }
            )
            context.close()
        browser.close()

    print(json.dumps({"results": results, "errors": errors}, ensure_ascii=False, indent=2))
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
