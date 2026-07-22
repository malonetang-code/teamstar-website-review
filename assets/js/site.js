(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute(
        "aria-label",
        !isOpen ? menuButton.dataset.closeLabel : menuButton.dataset.openLabel
      );
      mobileMenu.hidden = isOpen;
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuButton.setAttribute("aria-expanded", "false");
        mobileMenu.hidden = true;
      });
    });
  }

  document.querySelectorAll("[data-rfq-form]").forEach(function (form) {
    const language = document.documentElement.lang === "en" ? "en" : "zh";
    const steps = Array.from(form.querySelectorAll("[data-rfq-step]"));
    const progress = form.querySelector("[data-rfq-progress]");
    const progressItems = progress ? Array.from(progress.querySelectorAll("li")) : [];
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector("button[type='submit']");
    const referenceInput = form.querySelector("[data-rfq-reference-input]");
    const referenceLabel = form.querySelector("[data-rfq-reference-label]");
    const review = form.querySelector("[data-rfq-review]");
    const success = form.querySelector("[data-rfq-success]");
    const successReference = form.querySelector("[data-rfq-success-reference]");
    const restart = form.querySelector("[data-rfq-restart]");
    const emailLinks = Array.from(form.querySelectorAll("[data-rfq-email]"));
    const pathInputs = Array.from(form.querySelectorAll("input[name='inquiry_path']"));
    const productSelect = form.querySelector("[name='product_category']");
    const messageLabel = form.querySelector("[data-rfq-message-label]");
    const message = form.querySelector("[data-rfq-message]");
    const pathHelp = form.querySelector("[data-rfq-path-help]");
    const fileInput = form.querySelector("[data-rfq-files]");
    const fileSelection = form.querySelector("[data-rfq-file-selection]");
    const fileList = form.querySelector("[data-rfq-file-list]");
    const fileClear = form.querySelector("[data-rfq-file-clear]");
    const fileStatus = form.querySelector("[data-rfq-file-status]");
    const maxFiles = 10;
    const maxFileBytes = 25 * 1024 * 1024;
    const maxTotalBytes = 100 * 1024 * 1024;
    const allowedExtensions = new Set(["pdf", "dxf", "dwg", "step", "stp", "igs", "iges", "zip", "jpg", "jpeg", "png", "webp"]);
    let currentStep = 0;

    if (steps.length !== 3) return;

    const copy = language === "en" ? {
      reference: "RFQ",
      sending: "Uploading and sending...",
      rateLimit: "The form received too many requests. Please wait and try again, or email info@teamstarmfg.com.",
      failed: "The form could not be sent. Your information remains on this page; please retry or email info@teamstarmfg.com.",
      tooLarge: "The selected files exceed the upload limit. Remove one or more files and try again.",
      fileCount: "A maximum of 10 files can be uploaded.",
      fileSize: "Each file must be 25 MB or smaller.",
      fileTotal: "The combined file size must not exceed 100 MB.",
      fileType: "One or more selected file types are not supported.",
      removeFile: "Remove file",
      noFiles: "No files selected",
      reviewLabels: ["Contact", "Starting point", "Product category", "Machine", "Processed material", "Quantity", "Technical requirements", "Attachments"],
      paths: { drawing: "Drawing", sample: "Sample", application: "Application" },
      prompts: {
        drawing: ["Drawing dimensions, revision and technical requirements", "Include dimensions, tolerances, thickness, hole pattern, material or hardness requirements and drawing revision where known."],
        sample: ["Sample condition, mounting details and current issue", "Describe the physical sample or old blade, mounting interfaces, edge geometry, visible wear or failure and any known dimensions."],
        application: ["Operating conditions, current issue and target", "Describe the machine, processed material, operating frequency, current cutting issue and target service life or cut quality."]
      }
    } : {
      reference: "询价编号",
      sending: "正在上传并发送...",
      rateLimit: "提交请求过于频繁，请稍后重试，或直接邮件联系 info@teamstarmfg.com。",
      failed: "表单暂未发送成功，已填写内容仍保留在本页；请重试或直接邮件联系 info@teamstarmfg.com。",
      tooLarge: "所选附件超出上传限制，请移除部分文件后重试。",
      fileCount: "最多可上传10个文件。",
      fileSize: "单个文件不能超过25MB。",
      fileTotal: "附件总大小不能超过100MB。",
      fileType: "所选附件中包含不支持的文件类型。",
      removeFile: "删除附件",
      noFiles: "未选择附件",
      reviewLabels: ["联系人", "资料入口", "刀具类别", "设备", "被处理材料", "需求数量", "技术要求", "附件"],
      paths: { drawing: "按图制造", sample: "按样复刻", application: "工况评估" },
      prompts: {
        drawing: ["图纸尺寸、版本及技术要求", "可填写尺寸、公差、厚度、孔位、材料或硬度要求及图纸版本等现有信息。"],
        sample: ["样品状态、安装方式及当前问题", "请描述实物样品或旧刀、安装接口、刃口几何、可见磨损或失效情况及已知尺寸。"],
        application: ["使用工况、当前问题及预期目标", "请描述设备、被处理材料、使用频率、当前切割问题，以及预期使用寿命或切口质量。"]
      }
    };

    function createReference() {
      const date = new Date();
      const stamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("");
      const random = Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, "0");
      return `TS-${stamp}-${random}`;
    }

    function updateEmailLinks(reference) {
      emailLinks.forEach(function (link) {
        const email = link.getAttribute("href").replace(/^mailto:/, "").split("?")[0];
        const subject = language === "en"
          ? `${reference} - RFQ drawings and photographs`
          : `${reference} - 询价图纸与照片`;
        const body = language === "en"
          ? `RFQ reference: ${reference}\nCompany: \nFiles attached: `
          : `询价编号：${reference}\n公司：\n附件说明：`;
        link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    }

    function assignReference() {
      const reference = createReference();
      referenceInput.value = reference;
      referenceInput.defaultValue = reference;
      referenceLabel.textContent = `${copy.reference} ${reference}`;
      updateEmailLinks(reference);
      return reference;
    }

    function validateStep(index) {
      if (steps[index].contains(fileInput) && !validateFiles(true)) return false;
      const controls = Array.from(steps[index].querySelectorAll("input, select, textarea"));
      for (const control of controls) {
        if (!control.checkValidity()) {
          control.reportValidity();
          return false;
        }
      }
      return true;
    }

    function selectedPath() {
      const selected = form.querySelector("input[name='inquiry_path']:checked");
      return selected ? selected.value : "";
    }

    function updatePathPrompt() {
      const path = selectedPath();
      const prompt = copy.prompts[path];
      if (!prompt) return;
      messageLabel.firstChild.nodeValue = `${prompt[0]} `;
      message.placeholder = prompt[1];
      pathHelp.textContent = prompt[1];
    }

    function addReviewRow(label, value) {
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value || "-";
      review.append(term, description);
    }

    function renderReview() {
      const selectedProduct = productSelect.options[productSelect.selectedIndex];
      const contact = [form.elements.company.value, form.elements.name.value, form.elements.email.value]
        .filter(Boolean)
        .join(" / ");
      review.replaceChildren();
      addReviewRow(copy.reviewLabels[0], contact);
      addReviewRow(copy.reviewLabels[1], copy.paths[selectedPath()] || "-");
      addReviewRow(copy.reviewLabels[2], selectedProduct ? selectedProduct.textContent : "-");
      addReviewRow(copy.reviewLabels[3], form.elements.machine_make_model.value);
      addReviewRow(copy.reviewLabels[4], form.elements.processed_material.value);
      addReviewRow(copy.reviewLabels[5], form.elements.quantity.value);
      addReviewRow(copy.reviewLabels[6], form.elements.technical_requirements.value);
      const fileNames = Array.from(fileInput.files || []).map(function (file) { return file.name; });
      addReviewRow(copy.reviewLabels[7], fileNames.length ? fileNames.join(", ") : copy.noFiles);
    }

    function formatBytes(bytes) {
      if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${bytes} B`;
    }

    function selectedFiles() {
      return Array.from(fileInput.files || []);
    }

    function validateFiles(showMessage) {
      const files = selectedFiles();
      const totalBytes = files.reduce(function (sum, file) { return sum + file.size; }, 0);
      let error = "";

      if (files.length > maxFiles) error = copy.fileCount;
      else if (files.some(function (file) { return file.size > maxFileBytes; })) error = copy.fileSize;
      else if (totalBytes > maxTotalBytes) error = copy.fileTotal;
      else if (files.some(function (file) {
        const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
        return !allowedExtensions.has(extension);
      })) error = copy.fileType;

      fileInput.setCustomValidity(error);
      fileStatus.className = `file-status${error ? " error" : ""}`;
      fileStatus.textContent = showMessage ? error : "";
      return error === "";
    }

    function renderSelectedFiles() {
      const files = selectedFiles();
      fileList.replaceChildren();
      fileSelection.hidden = files.length === 0;

      files.forEach(function (file, index) {
        const item = document.createElement("li");
        const label = document.createElement("span");
        const remove = document.createElement("button");
        label.textContent = `${file.name} · ${formatBytes(file.size)}`;
        remove.type = "button";
        remove.className = "file-remove";
        remove.textContent = "×";
        remove.title = `${copy.removeFile}: ${file.name}`;
        remove.setAttribute("aria-label", `${copy.removeFile}: ${file.name}`);
        remove.addEventListener("click", function () {
          const transfer = new DataTransfer();
          files.forEach(function (candidate, candidateIndex) {
            if (candidateIndex !== index) transfer.items.add(candidate);
          });
          fileInput.files = transfer.files;
          validateFiles(false);
          renderSelectedFiles();
        });
        item.append(label, remove);
        fileList.append(item);
      });

      validateFiles(files.length > 0);
    }

    function showStep(index, focusStep) {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach(function (step, stepIndex) {
        step.hidden = stepIndex !== currentStep;
      });
      progressItems.forEach(function (item, itemIndex) {
        if (itemIndex === currentStep) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
        item.classList.toggle("is-complete", itemIndex < currentStep);
      });
      if (currentStep === 2) renderReview();
      if (focusStep) {
        const legend = steps[currentStep].querySelector("legend");
        legend.tabIndex = -1;
        legend.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function applyEntryParameters() {
      const parameters = new URLSearchParams(window.location.search);
      let path = parameters.get("type");
      const legacyHash = window.location.hash.replace("#", "");
      if (!copy.paths[path] && copy.paths[legacyHash]) path = legacyHash;
      if (copy.paths[path]) {
        const input = form.querySelector(`input[name='inquiry_path'][value='${path}']`);
        input.checked = true;
        updatePathPrompt();
      }

      const product = parameters.get("product");
      if (product && Array.from(productSelect.options).some((option) => option.value === product)) {
        productSelect.value = product;
      }
    }

    form.classList.add("is-enhanced");
    form.noValidate = true;
    assignReference();
    applyEntryParameters();
    showStep(0, false);

    pathInputs.forEach(function (input) {
      input.addEventListener("change", updatePathPrompt);
    });

    fileInput.addEventListener("change", renderSelectedFiles);
    fileClear.addEventListener("click", function () {
      fileInput.value = "";
      validateFiles(false);
      renderSelectedFiles();
      fileInput.focus();
    });

    form.querySelectorAll("[data-rfq-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (validateStep(currentStep)) showStep(currentStep + 1, true);
      });
    });

    form.querySelectorAll("[data-rfq-back]").forEach(function (button) {
      button.addEventListener("click", function () {
        showStep(currentStep - 1, true);
      });
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (currentStep < steps.length - 1) {
        if (validateStep(currentStep)) showStep(currentStep + 1, true);
        return;
      }
      if (!validateStep(currentStep)) return;

      const idleLabel = submit.textContent;
      let submittedReference = referenceInput.value;
      submit.disabled = true;
      submit.textContent = copy.sending;
      status.className = "form-status";
      status.textContent = "";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });

        const responsePayload = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          const error = new Error("Submission failed");
          error.status = response.status;
          throw error;
        }

        if (responsePayload.reference) {
          submittedReference = responsePayload.reference;
          referenceInput.value = submittedReference;
          referenceLabel.textContent = `${copy.reference} ${submittedReference}`;
        }

        steps.forEach(function (step) { step.hidden = true; });
        progress.hidden = true;
        status.textContent = "";
        successReference.textContent = submittedReference;
        updateEmailLinks(submittedReference);
        success.hidden = false;
        success.focus();
      } catch (error) {
        status.className = "form-status error";
        status.textContent = error.status === 429
          ? copy.rateLimit
          : error.status === 413
            ? copy.tooLarge
            : copy.failed;
      } finally {
        submit.disabled = false;
        submit.textContent = idleLabel;
      }
    });

    restart.addEventListener("click", function () {
      form.reset();
      renderSelectedFiles();
      success.hidden = true;
      progress.hidden = false;
      assignReference();
      applyEntryParameters();
      showStep(0, true);
    });
  });
})();
