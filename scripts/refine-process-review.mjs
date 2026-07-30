import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20260730-2s";

const replacements = {
  "capabilities/index.html": [
    [
      "按产品结构 材料 图纸与工况要求配置刀坯成形 热处理 机加工 研磨及检测工序",
      "按产品结构、材料、图纸与工况要求，配置刀坯成形、热处理、机加工、研磨及检测工序。",
    ],
    [
      "刀坯成形 热处理 精密加工 研磨与检测协同保障刀具几何 刃口及批次要求",
      "刀坯成形、热处理、精密加工、研磨与检测协同保障刀具几何、刃口及批次要求。",
    ],
    [
      "按材料 刀具结构及应用要求统筹刀坯成形 热处理与后续研磨 具体参数以图纸及技术评估结果为准",
      "按材料、刀具结构及应用要求，统筹刀坯成形、热处理与后续研磨；具体参数以图纸及技术评估结果为准。",
    ],
    [
      "直刃刀 圆刀 锯片及异型件的机加工与研磨 重点控制安装接口 刀具几何及批次重复性",
      "直刃刀、圆刀、锯片及异型件的机加工与研磨，重点控制安装接口、刀具几何及批次重复性。",
    ],
    [
      "材料成分 尺寸 硬度 金相及影像测量 支撑样品验证 成品检验与批次一致性",
      "材料成分、尺寸、硬度、金相及影像测量，支撑样品验证、成品检验与批次一致性。",
    ],
    [
      "漳州基地实拍记录从来料核对到包装防护的工艺路径 具体工序按刀型 材料及经确认的技术要求安排",
      "漳州基地实拍记录从来料核对到包装防护的工艺路径，具体工序按刀型、材料及经确认的技术要求安排。",
    ],
    [
      "使用手持分析设备核对材料 具体牌号与要求以技术文件及检验记录为准",
      "使用手持分析设备核对材料，具体牌号与要求以技术文件及检验记录为准。",
    ],
    [
      "按确认版图纸进行激光切割等刀坯成形 后续工序依据结构与材料安排",
      "按确认版图纸进行激光切割等刀坯成形，后续工序依据结构与材料安排。",
    ],
    [
      "刀坯按确认工艺路线进入热处理 温度曲线及具体参数不在网站公开",
      "刀坯按确认工艺路线进入热处理，温度曲线及具体参数不在网站公开。",
    ],
    [
      "机加工依据安装接口及几何要求安排 可实现范围与公差结合图纸评估",
      "机加工依据安装接口及几何要求安排，可实现范围与公差需结合图纸评估。",
    ],
    [
      "相应研磨工序形成刃口与关键表面 磨削方案按刀型及应用要求确认",
      "相应研磨工序形成刃口与关键表面，磨削方案按刀型及应用要求确认。",
    ],
    [
      "加工过程中使用量具与检测设备核对相应特征 并按确认版图纸及过程要求执行",
      "加工过程中使用量具与检测设备核对相应特征，并按确认版图纸及过程要求执行。",
    ],
    [
      "成品按确认版图纸及验收要求检查尺寸与相关项目 批次记录受控保存",
      "成品按确认版图纸及验收要求检查尺寸与相关项目，批次记录受控保存。",
    ],
    [
      "按刀型及交付条件执行清洁 刃口防护与包装 标签及批次信息按项目要求管理",
      "按刀型及交付条件执行清洁、刃口防护与包装，标签及批次信息按项目要求管理。",
    ],
    [
      "网页素材仅展示作业方式 受控图纸 检验记录及具体工艺参数不公开",
      "网页素材仅展示作业方式，受控图纸、检验记录及具体工艺参数不公开。",
    ],
    [
      "漳州基地当前生产环境中的机加工设备列阵 设备加工区域与激光切割设备",
      "漳州基地当前生产环境中的机加工设备列阵、设备加工区域与激光切割设备。",
    ],
    [
      "可提交图纸 旧刀照片 实物样品或设备与工况资料用于制造评估",
      "可提交图纸、旧刀照片、实物样品或设备与工况资料，用于制造评估。",
    ],
  ],
  "en/capabilities/index.html": [
    [
      "Process planning aligned with blade geometry material drawings and operating requirements",
      "Process planning aligned with blade geometry, material, drawings and operating requirements.",
    ],
    [
      "Integrated shaping heat treatment precision machining grinding and inspection for geometry edge and batch requirements",
      "Integrated shaping, heat treatment, precision machining, grinding and inspection for geometry, edge and batch requirements.",
    ],
    [
      "Coordinated blade shaping heat treatment and downstream grinding according to material geometry and application requirements with final parameters set through drawing and technical review",
      "Coordinated blade shaping, heat treatment and downstream grinding according to material, geometry and application requirements, with final parameters set through drawing and technical review.",
    ],
    [
      "Machining and grinding for straight knives rotary knives saw blades and custom parts with control focused on mounting interfaces blade geometry and batch repeatability",
      "Machining and grinding for straight knives, rotary knives, saw blades and custom parts, with control focused on mounting interfaces, blade geometry and batch repeatability.",
    ],
    [
      "Material composition dimensional hardness metallographic and image measurement inspection for prototype validation final inspection and batch consistency",
      "Material composition, dimensional, hardness, metallographic and image-measurement inspection for prototype validation, final inspection and batch consistency.",
    ],
    [
      "Real production media from the Zhangzhou base documents the route from incoming material checks to protective packaging with the exact sequence set by blade geometry material and approved technical requirements",
      "Real production media from the Zhangzhou base documents the route from incoming material checks to protective packaging, with the exact sequence set by blade geometry, material and approved technical requirements.",
    ],
    [
      "Handheld analysis supports applicable material checks with final grades and requirements governed by controlled technical documents and inspection records",
      "Handheld analysis supports applicable material checks, with final grades and requirements governed by controlled technical documents and inspection records.",
    ],
    [
      "Laser cutting and other blank shaping follow the approved drawing with later operations planned around geometry and material",
      "Laser cutting and other blank shaping follow the approved drawing, with later operations planned around geometry and material.",
    ],
    [
      "Blade blanks enter heat treatment through the approved process route with temperature profiles and detailed parameters kept controlled",
      "Blade blanks enter heat treatment through the approved process route, with temperature profiles and detailed parameters kept controlled.",
    ],
    [
      "Machining follows mounting interface and geometry requirements with feasible ranges and tolerances confirmed through drawing review",
      "Machining follows mounting-interface and geometry requirements, with feasible ranges and tolerances confirmed through drawing review.",
    ],
    [
      "Applicable grinding forms the cutting edge and critical surfaces with the route confirmed for each blade geometry and application",
      "Applicable grinding forms the cutting edge and critical surfaces, with the route confirmed for each blade geometry and application.",
    ],
    [
      "Gauges and inspection equipment verify applicable features during production against the approved drawing and process requirements",
      "Gauges and inspection equipment verify applicable features during production against the approved drawing and process requirements.",
    ],
    [
      "Finished blades are checked against the approved drawing and acceptance requirements with applicable batch records retained under control",
      "Finished blades are checked against the approved drawing and acceptance requirements, with applicable batch records retained under control.",
    ],
    [
      "Cleaning edge protection and packaging follow blade and delivery conditions with labels and batch information managed to project requirements",
      "Cleaning, edge protection and packaging follow blade and delivery conditions, with labels and batch information managed to project requirements.",
    ],
    [
      "Media shows working methods without disclosing controlled drawings inspection records or process parameters",
      "Media shows working methods without disclosing controlled drawings, inspection records or process parameters.",
    ],
    [
      "Machining equipment lines production equipment and laser cutting within the current Zhangzhou manufacturing environment",
      "The photographs show machining equipment lines, production equipment and laser-cutting equipment within the current Zhangzhou manufacturing environment.",
    ],
    [
      "Drawings old blade photographs physical samples or machine and operating information for manufacturing review",
      "Drawings, old-blade photographs, physical samples, or machine and operating information can be submitted for manufacturing review.",
    ],
  ],
};

function replaceOnce(content, from, to, file) {
  if (content.includes(to) && !content.includes(from)) return content;
  const occurrences = content.split(from).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${file}: expected one occurrence of ${JSON.stringify(from)}, found ${occurrences}`);
  }
  return content.replace(from, to);
}

for (const [relativePath, pairs] of Object.entries(replacements)) {
  const file = path.join(root, relativePath);
  let html = fs.readFileSync(file, "utf8");
  for (const [from, to] of pairs) html = replaceOnce(html, from, to, relativePath);
  html = replaceOnce(
    html,
    "process-viewer.css?v=20260729-2s1",
    `process-viewer.css?v=${version}`,
    relativePath,
  );
  html = replaceOnce(
    html,
    "process-viewer.js?v=20260729-2s1",
    `process-viewer.js?v=${version}`,
    relativePath,
  );
  fs.writeFileSync(file, html);
}

console.log(`Process review copy and asset version refined for ${Object.keys(replacements).length} pages`);
