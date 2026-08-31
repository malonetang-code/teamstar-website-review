import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20260730-2t";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content);
}

function replaceAll(content, from, to, file) {
  if (!content.includes(from)) {
    if (content.includes(to)) return content;
    throw new Error(`${file}: copy not found: ${JSON.stringify(from)}`);
  }
  return content.split(from).join(to);
}

function applyReplacements(relativePath, replacements) {
  let html = read(relativePath);
  for (const [from, to] of replacements) {
    html = replaceAll(html, from, to, relativePath);
  }
  write(relativePath, html);
}

function walkHtml(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtml(absolute);
    return entry.name.endsWith(".html") ? [path.relative(root, absolute)] : [];
  });
}

const htmlFiles = walkHtml();

const commonChinese = [
  [
    "提交工业机械刀具技术询价",
    "提交图纸、样品或工况资料",
  ],
  [
    "可提交图纸、旧刀照片、实物样品或设备与工况资料，用于制造评估。",
    "工程团队将根据现有资料核对刀具结构、制造可行性及报价所需的补充信息。",
  ],
  ["查看询价资料要求", "准备询价资料"],
  [
    "依据图纸、实物样品及工况要求定制制造工业机械刀具。",
    "根据图纸、实物样品和使用要求制造工业机械刀具。",
  ],
];

const commonEnglish = [
  [
    "Submit a technical RFQ for industrial machine knives",
    "Send your drawing, sample or application details",
  ],
  [
    "Drawings, old-blade photographs, physical samples or machine and operating information can be submitted for manufacturing review.",
    "Our engineering team reviews the available information, confirms manufacturability and identifies the details still required for quotation.",
  ],
  [
    "Drawings, old-blade photographs, physical samples, or machine and operating information can be submitted for manufacturing review.",
    "Our engineering team reviews the available information, confirms manufacturability and identifies the details still required for quotation.",
  ],
  ["View RFQ requirements", "Prepare RFQ information"],
  [
    "Custom industrial machine knives manufactured from drawings, physical samples and application requirements.",
    "Industrial machine knives manufactured from drawings, physical samples and application requirements.",
  ],
];

for (const file of htmlFiles) {
  let html = read(file);
  for (const [from, to] of [...commonChinese, ...commonEnglish]) {
    if (html.includes(from)) html = html.split(from).join(to);
  }
  write(file, html);
}

applyReplacements("index.html", [
  ["工业机械刀具<br>定制制造", "定制工业机械刀具"],
  [
    "面向设备制造商、品牌企业及工业用户的定制刀具项目，可从图纸、实物样品或设备工况开始技术评估。制造工艺与报价由工程团队依据刀具结构、被处理材料、数量及验收要求确认。",
    "根据图纸、实物样品或设备工况制造工业机械刀具。工程团队评估刀具结构、被处理材料、制造工艺、数量与验收要求，并据此提供报价。",
  ],
  ["按现有资料发起询价", "提交项目资料"],
  [
    "先按最接近的设备应用和被处理材料进行判断，每个分类均列明启动制造评估所需的技术资料。",
    "按设备应用和被处理材料选择最接近的产品类别；无法确定分类时，可直接提交现有资料。",
  ],
  ["技术评估资料入口", "三种项目资料入口"],
  [
    "可依据完整图纸、实物样品、清晰照片或设备与工况资料启动制造评估。",
    "图纸、实物样品或设备工况均可作为技术询价的起点。",
  ],
  [
    "尺寸、公差、材料、数量及图纸版本构成报价和工艺评估的基础资料。",
    "提交尺寸、公差、材料、数量及图纸版本，用于制造可行性和报价评估。",
  ],
  [
    "实物样品、旧刀或清晰照片可用于核对安装接口、刃口几何及失效情况。",
    "提供实物样品、旧刀或多角度照片，用于核对安装接口、刃口几何和磨损情况。",
  ],
  [
    "制造工艺依据设备、被处理材料、使用频率及预期使用寿命进行评估。",
    "提供设备、被处理材料、运行方式和目标，用于评估刀具方案与制造路线。",
  ],
  [
    "材料评估、刀坯成形、热处理、机加工、精密研磨与检测，依据刀具结构和验收要求形成相应工艺路线。",
    "从材料确认、刀坯成形到热处理、机加工、精密研磨和检测，工艺路线围绕刀具结构与验收要求制定。",
  ],
  [
    "依据材料、刀具结构及应用要求，评估刀坯成形、热处理与后续研磨的工艺衔接。具体参数以图纸和技术评估结果为准。",
    "根据材料、刀具结构与使用要求，衔接刀坯成形、热处理和后续研磨工序。",
  ],
  [
    "适用于直刃刀、圆刀、锯片及异型件的机加工与研磨工艺，重点控制安装接口、刀具几何和批次重复性。",
    "围绕直刃刀、圆刀、锯片和异型件的安装接口、刀具几何与批次重复性安排机加工和研磨。",
  ],
  [
    "材料成分、尺寸、硬度、金相及影像测量等检验项目，为样品验证、成品检验和批次一致性提供依据。",
    "通过材料成分、尺寸、硬度、金相和影像测量，为样品验证、成品检验与批次放行提供依据。",
  ],
  [
    "材料分析、三坐标测量、影像尺寸测量与金相检验，为相应的材料、尺寸和过程检验提供支持。",
    "材料分析、三坐标测量、影像测量与金相检验覆盖来料、过程和成品的关键质量要求。",
  ],
  [
    "群新工业（漳州）有限公司是伟群制刀工业集团成员企业，2024 年 6 月启动漳州生产基地搬迁，延续集团在工业刀具与切削工具领域的制造经验。",
    "群新工业（漳州）有限公司是伟群制刀工业集团成员企业，2024 年 6 月启动漳州生产基地搬迁，专注工业机械刀具制造。",
  ],
  [
    "相关项目覆盖多类刀具、设备品牌与工业应用，合作对象包括品牌企业、设备制造商及工业用户。",
    "项目服务对象包括设备制造商、品牌企业和工业用户，覆盖多类刀具与设备应用。",
  ],
  ["按五个原文件夹分类的产品实物照片", "群新工业机械刀具产品实拍"],
]);

applyReplacements("en/index.html", [
  [
    "For custom knife projects from equipment manufacturers, brand owners and industrial users, technical review can begin with a drawing, physical sample or documented machine application. Manufacturing processes and quotation are confirmed against blade geometry, processed material, quantity and acceptance requirements.",
    "Industrial machine knives manufactured from drawings, physical samples or documented machine applications. Our engineering team reviews blade geometry, processed material, manufacturing route, quantity and acceptance criteria before preparing a quotation.",
  ],
  ["Start a technical RFQ", "Send project information"],
  [
    "Compare the closest machine application and processed material first. Each category lists the technical information needed to begin manufacturing review.",
    "Choose the closest product category by machine application and processed material, or send the information available if the category is unclear.",
  ],
  ["Technical inputs for RFQ review", "Three ways to start an RFQ"],
  [
    "Manufacturing review can begin from a complete drawing, a physical sample, clear photographs or documented machine and operating conditions.",
    "A drawing, physical sample or documented machine application can each start a technical RFQ.",
  ],
  [
    "Dimensions, tolerances, material, quantity and drawing revision form the basis of quotation and process review.",
    "Send dimensions, tolerances, material, quantity and drawing revision for manufacturability and quotation review.",
  ],
  [
    "Physical samples, old blades or clear photographs support review of mounting interfaces, edge geometry and failure conditions.",
    "Send a physical sample, old blade or clear multi-angle photographs to review interfaces, edge geometry and wear.",
  ],
  [
    "The manufacturing route is reviewed against the machine, processed material, operating frequency and target service life.",
    "Send the machine, processed material, operating method and target so we can review the blade and manufacturing route.",
  ],
  [
    "Material review, blade shaping, heat treatment, machining, precision grinding and inspection are configured according to blade geometry and acceptance requirements.",
    "From material verification and blank shaping to heat treatment, machining, precision grinding and inspection, the manufacturing route follows blade geometry and acceptance criteria.",
  ],
  [
    "Blade shaping, heat treatment and downstream grinding are planned together according to material, geometry and application requirements. Final parameters follow drawing and technical review.",
    "Blank shaping, heat treatment and downstream grinding are planned together around the material, blade geometry and application.",
  ],
  [
    "Machining and grinding processes for straight knives, rotary knives, saw blades and custom parts, with control focused on mounting interfaces, blade geometry and batch repeatability.",
    "Machining and grinding for straight knives, rotary knives, saw blades and custom parts, focused on mounting interfaces, blade geometry and batch repeatability.",
  ],
  [
    "Material-composition, dimensional, hardness, metallographic and image-measurement inspections support prototype validation, final inspection and batch consistency.",
    "Material composition, dimensions, hardness, metallography and optical measurement support prototype validation, final inspection and batch release.",
  ],
  [
    "Material analysis, coordinate measurement, image measurement and metallography support applicable material, dimensional and process inspections.",
    "Material analysis, coordinate measurement, optical measurement and metallography cover key incoming, in-process and final requirements.",
  ],
  [
    "Qunxin Industrial is a member of Wei Qun Cutting Tools Group. The move to its Zhangzhou manufacturing base began in June 2024, continuing the group’s experience in industrial knives and cutting tools.",
    "Qunxin Industrial is a member of Wei Qun Cutting Tools Group. The move to its Zhangzhou manufacturing base began in June 2024, with a focus on industrial machine-knife manufacturing.",
  ],
  [
    "Relevant projects cover multiple blade families, equipment brands and industrial applications for brand owners, equipment manufacturers and industrial users.",
    "Projects serve equipment manufacturers, brand owners and industrial users across multiple blade families and machine applications.",
  ],
  [
    "Product photographs from the five source-defined categories",
    "Teamstar industrial machine-knife product photographs",
  ],
]);

applyReplacements("products/index.html", [
  [
    "产品按行业、设备与典型类型分类。",
    "产品按木工、食品、塑料回收、纸品分切、纺织服装及设备配套六类应用组织。",
  ],
  ["按应用选择产品", "查看产品分类"],
  ["按现有资料询价", "提交项目资料"],
  ["刀具分类", "按应用分类"],
  [
    "可从设备、被处理材料及当前切割问题开始，工程团队将依据这些资料判断适用的评估路径。",
    "提交设备、被处理材料和当前切割问题，工程团队将协助识别刀具类别及后续资料要求。",
  ],
  ["从设备工况开始询价", "提交设备与工况"],
  ["选型与制造评估要素", "制造评估关注要点"],
  [
    "同一通用刀型在不同设备、被处理材料与工况下，可能采用不同的材料牌号、热处理工艺、刃口几何及检验方案。",
    "即使刀型相近，不同设备、被处理材料和工况也可能需要不同的材料、热处理、刃口与检验方案。",
  ],
]);

applyReplacements("en/products/index.html", [
  [
    "Products are classified by industry, equipment and typical type.",
    "Products are organised into six application groups: woodworking, food processing, plastics recycling, paper converting, textile and machine-specific blades.",
  ],
  ["Find a product category", "Browse product categories"],
  ["Start a technical RFQ", "Send project information"],
  ["Knife categories", "Categories by application"],
  [
    "Start with the machine, processed material and current cutting problem. The engineering team will identify the applicable review path from those inputs.",
    "Send the machine, processed material and current cutting problem. Our engineering team will identify the likely blade category and any information still required.",
  ],
  ["Start from an application", "Send machine and application details"],
  ["Selection and manufacturing review criteria", "What engineering review considers"],
  [
    "Machine configuration, processed material and operating conditions may require different material grades, heat-treatment processes, edge geometries and inspection plans for the same general blade type.",
    "Similar blade shapes may still require different materials, heat treatment, edge geometry and inspection plans for different machines, processed materials and operating conditions.",
  ],
]);

const productPages = [
  ["woodworking-knives", "woodworking"],
  ["food-processing-knives", "food"],
  ["plastic-crusher-blades", "plastic"],
  ["paper-slitting-knives", "paper"],
  ["textile-cutting-knives", "textile"],
  ["custom-industrial-blades", "custom"],
];

const productHeroCopy = {
  woodworking: {
    zh: [
      "用于平刨、压刨、指接及家具生产设备的平刨刀、指接刀、电刨刀和配套刀片。产品结构依据图纸、实物样品或设备型号进行技术评估。",
      "适用于平刨机、压刨机、指接设备及家具生产线，可根据图纸、实物样品或设备型号评估平刨刀、指接刀、电刨刀及配套刀片。",
    ],
    en: [
      "Planer, finger-joint and equipment-specific knives for woodworking and furniture production. Blade geometry is reviewed from drawings, physical samples or machine information.",
      "Planer, finger-joint, electric-planer and equipment-specific knives for woodworking and furniture production, reviewed from drawings, physical samples or machine information.",
    ],
  },
  food: {
    zh: [
      "用于肉类切片、绞碎、分切及食品加工设备的机械刀具。材料、刃口与安装接口依据食品类型、清洁方式和设备要求进行评估。",
      "适用于肉类切片、绞碎、分切及其他食品加工设备，工程评估重点包括刀具材料、刃口、安装接口和清洁要求。",
    ],
    en: [
      "Machine knives for meat slicing, mincing, portioning and food-processing equipment. Material, edge geometry and mounting interfaces are reviewed against the product, cleaning method and machine requirements.",
      "Machine knives for meat slicing, mincing, portioning and other food-processing equipment, with engineering review focused on material, edge geometry, mounting interfaces and cleaning requirements.",
    ],
  },
  plastic: {
    zh: [
      "用于粉碎机、破碎机、造粒机及塑料回收设备。材料与制造工艺依据被处理材料、设备参数、负载及磨损情况进行评估。",
      "适用于粉碎机、破碎机、造粒机及塑料回收设备，材料与制造方案根据被处理材料、设备负载和磨损情况评估。",
    ],
    en: [
      "Knives for crushers, granulators and plastics-recycling equipment. Material and manufacturing processes are reviewed against the processed material, machine parameters, load and wear conditions.",
      "Knives for crushers, granulators and plastics-recycling equipment, with material and manufacturing routes reviewed against the processed material, machine load and wear conditions.",
    ],
  },
  paper: {
    zh: [
      "用于纸张、纸板和卷材的分条、修边与裁切。外径、内孔、厚度、端面及刃口要求依据图纸和设备条件确认。",
      "适用于纸张、纸板及卷材的分条、修边和裁切，重点核对外径、内孔、厚度、端面、刃口及设备配合要求。",
    ],
    en: [
      "Knives for slitting, edge trimming and cutting paper, board and web materials. Outside diameter, bore, thickness, face condition and edge requirements are confirmed from drawings and machine conditions.",
      "Knives for slitting, edge trimming and cutting paper, board and web materials, with review focused on outside diameter, bore, thickness, face condition, edge and machine fit.",
    ],
  },
  textile: {
    zh: [
      "用于纺织面料、工业织物及服装生产设备的裁刀、圆刀、剪刀和相关零件。刀具规格依据设备品牌型号、图纸或实物样品确认。",
      "适用于纺织面料、工业织物及服装生产设备，可根据设备型号、图纸或实物样品评估裁刀、圆刀、剪切刀及相关零件。",
    ],
    en: [
      "Cutting knives, rotary knives, scissors and related parts for textile, technical-fabric and apparel equipment. Specifications are confirmed from machine information, drawings or physical samples.",
      "Cutting knives, rotary knives, shear blades and related parts for textile, technical-fabric and apparel equipment, reviewed from machine information, drawings or physical samples.",
    ],
  },
  custom: {
    zh: [
      "面向停产零件替代、实物样品复刻、设备制造商配套及长期备件需求。安装接口、刀具几何与制造工艺依据技术资料和工况确认。",
      "用于停产备件替代、实物样品复刻、设备制造商配套及长期备件项目，重点核对安装接口、刀具几何和使用工况。",
    ],
    en: [
      "For discontinued-part replacement, physical-sample replication, equipment-manufacturer supply and long-term spare requirements. Mounting interfaces, blade geometry and manufacturing processes are confirmed from technical information and operating conditions.",
      "For discontinued-part replacement, physical-sample replication, equipment-manufacturer supply and long-term spare programmes, with review focused on mounting interfaces, blade geometry and operating conditions.",
    ],
  },
};

const productChinese = [
  ["选择询价资料入口", "提交项目资料"],
  ["查看询价资料指南", "查看资料清单"],
  ["过往相似产品实拍案例", "代表性产品实拍"],
  [
    "以下均为真实过往产品照片，已按当前六类应用归入本页。原文件夹名称与文件名仅作为来源标签保留；具体适配仍需依据图纸、样品、设备与工况确认。",
    "以下照片展示群新过往制造的同类刀具外形与结构。图片用于说明制造范围，具体尺寸、材料和设备适配性须根据项目资料确认。",
  ],
  ["根据现有资料发起技术评估", "从现有资料开始询价"],
  [
    "请选择最符合当前项目的资料入口，询价表单会自动带入本产品类别和对应资料路径。",
    "图纸、实物样品或设备工况均可作为起点，询价表单将自动带入本产品类别。",
  ],
  [
    "依据现行图纸核对尺寸、安装接口、受控公差、材料要求及图纸版本。",
    "上传现行图纸或 CAD 文件，用于核对尺寸、安装接口、公差、材料和版本。",
  ],
  [
    "依据旧刀、实物样品或清晰照片核对几何形状、安装细节、磨损及替换匹配。",
    "提供旧刀、未使用样品或多角度清晰照片，用于核对几何、安装和磨损情况。",
  ],
  [
    "暂无完整图纸时，可从设备、被处理材料、运行方式、当前问题及预期目标开始评估。",
    "提供设备型号、被处理材料、运行方式、当前问题和预期目标。",
  ],
  ["技术评估所需的关键信息", "工程评估所需信息"],
  [
    "首次联系不要求一次提供全部资料，暂不确定的项目可在后续技术沟通中确认。",
    "首次询价可先提交现有资料，缺失信息由工程团队在技术沟通中逐项确认。",
  ],
  ["技术评估与批量制造流程", "从技术评估到批量交付"],
  ["技术要求确认", "项目资料确认"],
  [
    "确认尺寸、安装接口、设备信息、被处理材料及需求数量。",
    "核对尺寸、安装接口、设备信息、被处理材料和需求数量。",
  ],
  ["工艺路线制定", "制造方案确认"],
  [
    "制定相应的材料、成形、热处理、机加工、研磨及检验工艺。",
    "根据刀具结构与使用要求确定材料、热处理、机加工、研磨和检验方案。",
  ],
  ["样品验证", "样品试用与确认"],
  [
    "批量制造前确认安装情况及切削应用反馈。",
    "批量制造前确认安装、切削表现和需要调整的项目。",
  ],
  ["批量制造与检验", "批量制造与放行"],
  [
    "依据确认版图纸与验收标准执行制造和检验。",
    "按确认版图纸和验收要求完成制造、检验与批次放行。",
  ],
  ["技术询价资料", "准备项目资料"],
  ["提交技术询价", "开始技术询价"],
];

const productEnglish = [
  ["Choose an RFQ starting point", "Send project information"],
  ["RFQ preparation guide", "View the information checklist"],
  ["Previous similar-product photo cases", "Representative product photographs"],
  [
    "These are real photographs of previous products, reassigned to the current six application categories. Original folder names and filenames are retained only as source labels; exact suitability still requires drawings, samples, machine information and operating conditions.",
    "These photographs show the form and construction of related knives previously manufactured by Teamstar. They demonstrate manufacturing scope; dimensions, material and machine fit must be confirmed for each project.",
  ],
  ["Start with the information available now", "Start with the information you have"],
  [
    "Choose the route that best matches your project. Each route opens the RFQ form with this product category and information path already selected.",
    "A drawing, physical sample or documented machine application can each start the enquiry. The form will carry this product category forward.",
  ],
  [
    "Use a current drawing to review dimensions, interfaces, controlled tolerances, material requirements and revision status.",
    "Send a current drawing or CAD file to review dimensions, mounting interfaces, tolerances, material and revision status.",
  ],
  [
    "Use an old blade, physical sample or clear photographs to review geometry, mounting details, wear and replacement fit.",
    "Send an old blade, unused sample or clear multi-angle photographs to review geometry, mounting details and wear.",
  ],
  [
    "Start from the machine, processed material, operating method, current problem and target when no complete drawing is available.",
    "Send the machine model, processed material, operating method, current problem and target.",
  ],
  ["Information used for technical review", "Information used by our engineering team"],
  [
    "Complete information is helpful but not required for the first contact. Unknown items can be confirmed with our technical team during review.",
    "Send the information available now. Our engineering team will identify and confirm any missing details during review.",
  ],
  ["Technical review and series production process", "From engineering review to series delivery"],
  ["Technical requirement review", "Project information review"],
  [
    "Confirm dimensions, mounting interfaces, machine information, processed material and quantity.",
    "Review dimensions, mounting interfaces, machine information, processed material and quantity.",
  ],
  ["Process planning", "Manufacturing plan"],
  [
    "Define the applicable material, shaping, heat-treatment, machining, grinding and inspection processes.",
    "Define the material, heat treatment, machining, grinding and inspection plan around the blade and application.",
  ],
  ["Prototype validation", "Sample trial and approval"],
  [
    "Confirm installation and cutting-performance feedback before series production.",
    "Confirm installation, cutting performance and any required adjustment before series production.",
  ],
  ["Series production and inspection", "Series production and release"],
  [
    "Manufacture and inspect against the approved drawing and acceptance criteria.",
    "Manufacture, inspect and release the batch against the approved drawing and acceptance criteria.",
  ],
  ["Technical RFQ information", "Prepare project information"],
  ["Submit a technical RFQ", "Start a technical RFQ"],
];

for (const [slug, key] of productPages) {
  const zhPath = `products/${slug}/index.html`;
  const enPath = `en/products/${slug}/index.html`;
  applyReplacements(zhPath, [productHeroCopy[key].zh, ...productChinese]);
  applyReplacements(enPath, [productHeroCopy[key].en, ...productEnglish]);

  let zh = read(zhPath)
    .replace(/<small>来源标签：[^<]+<\/small>/g, "")
    .replace(/来源文件夹：[^<]+/g, "点击图片查看完整画面")
    .replace(/(\d+) 张真实照片/g, "$1 张产品实拍")
    .replace(/实拍案例/g, "产品实拍");
  let en = read(enPath)
    .replace(/<small>Source label: [^<]+<\/small>/g, "")
    .replace(/Source folders: [^<]+/g, "Open any image for the full frame")
    .replace(/(\d+) real photographs/g, "$1 product photographs")
    .replace(/Previous case/g, "Product photo")
    .replace(/previous similar-product case/g, "representative product photograph");
  write(zhPath, zh);
  write(enPath, en);
}

const gallerySlugs = [
  "food-blades",
  "industrial-machine-knives",
  "packaging-blades",
  "sewing-blades",
  "woodworking-machine-blades",
];

for (const slug of gallerySlugs) {
  applyReplacements(`products/gallery/${slug}/index.html`, [
    [
      "本图册完整保留原始文件夹的类别名称与照片归属。具体产品规格需依据项目图纸、样品及工况资料确认。",
      "以下为群新过往制造的该类刀具实拍。图片用于展示产品外形与制造范围，具体规格和设备适配性须根据项目资料确认。",
    ],
    ["原文件夹完整图册", "产品实拍图册"],
    [
      "照片按原文件名顺序展示，未移动到其他产品分类。选择照片可查看较大的网页版本。",
      "点击图片可查看完整画面；具体产品分类和设备适配性须根据项目资料确认。",
    ],
  ]);
  applyReplacements(`en/products/gallery/${slug}/index.html`, [
    [
      "This gallery preserves the category name and photograph assignment from the original source folder. Product specifications are confirmed from project drawings, samples and application information.",
      "This gallery shows related knives previously manufactured by Teamstar. The photographs demonstrate product form and manufacturing scope; specifications and machine fit must be confirmed for each project.",
    ],
    ["Complete source-folder gallery", "Product photograph gallery"],
    [
      "Photographs are displayed in filename order and have not been moved into other product categories. Select an image to open the larger web version.",
      "Open any image to view the full frame. Product category and machine fit must be confirmed for each project.",
    ],
  ]);
  const zhGalleryPath = `products/gallery/${slug}/index.html`;
  const enGalleryPath = `en/products/gallery/${slug}/index.html`;
  write(
    zhGalleryPath,
    read(zhGalleryPath).replace(
      /按原始素材文件夹归类展示([^，"]+)专业产品照片，具体规格依据项目图纸、样品和工况资料确认。/g,
      "群新$1产品实拍，图片用于展示产品外形与制造范围，具体规格和设备适配性须根据项目资料确认。",
    ),
  );
  write(
    enGalleryPath,
    read(enGalleryPath).replace(
      /Professional ([^"]+?) photographs grouped exactly as supplied in the original source folder\. Project specifications are confirmed from drawings, samples and application information\./g,
      "Teamstar $1 product photographs demonstrate product form and manufacturing scope. Specifications and machine fit must be confirmed for each project.",
    ),
  );
}

applyReplacements("capabilities/index.html", [
  [
    "按产品结构、材料、图纸与工况要求，配置刀坯成形、热处理、机加工、研磨及检测工序。",
    "从材料确认、刀坯成形到热处理、机加工、研磨和检验，工艺路线依据刀具结构、图纸与使用条件制定。",
  ],
  [
    "刀坯成形、热处理、精密加工、研磨与检测协同保障刀具几何、刃口及批次要求。",
    "制造与检验围绕安装接口、刀具几何、刃口和批次一致性展开。",
  ],
  [
    "按材料、刀具结构及应用要求，统筹刀坯成形、热处理与后续研磨；具体参数以图纸及技术评估结果为准。",
    "根据材料、刀具结构和使用要求衔接刀坯成形、热处理与后续研磨。",
  ],
  [
    "直刃刀、圆刀、锯片及异型件的机加工与研磨，重点控制安装接口、刀具几何及批次重复性。",
    "针对直刃刀、圆刀、锯片及异型件，重点控制安装接口、刀具几何与批次重复性。",
  ],
  [
    "材料成分、尺寸、硬度、金相及影像测量，支撑样品验证、成品检验与批次一致性。",
    "材料成分、尺寸、硬度、金相和影像测量用于样品验证、成品检验与批次放行。",
  ],
  [
    "漳州基地实拍记录从来料核对到包装防护的工艺路径，具体工序按刀型、材料及经确认的技术要求安排。",
    "漳州基地实拍展示从材料确认到包装防护的主要工序；实际路线根据刀型、材料和技术要求制定。",
  ],
  [
    "使用手持分析设备核对材料，具体牌号与要求以技术文件及检验记录为准。",
    "使用手持分析设备核对材料，材料要求以受控技术文件为准。",
  ],
  [
    "按确认版图纸进行激光切割等刀坯成形，后续工序依据结构与材料安排。",
    "按确认版图纸完成激光切割等刀坯成形，为热处理和后续加工做准备。",
  ],
  [
    "刀坯按确认工艺路线进入热处理，温度曲线及具体参数不在网站公开。",
    "根据材料和刀型执行热处理，温度曲线与工艺参数受内部文件控制。",
  ],
  [
    "机加工依据安装接口及几何要求安排，可实现范围与公差需结合图纸评估。",
    "围绕安装接口、孔位和轮廓安排机加工，可实现公差需结合图纸评审。",
  ],
  [
    "相应研磨工序形成刃口与关键表面，磨削方案按刀型及应用要求确认。",
    "根据刀型和使用要求研磨刃口及关键表面。",
  ],
  [
    "加工过程中使用量具与检测设备核对相应特征，并按确认版图纸及过程要求执行。",
    "在关键工序使用量具与检测设备核对尺寸和表面要求。",
  ],
  [
    "成品按确认版图纸及验收要求检查尺寸与相关项目，批次记录受控保存。",
    "按确认版图纸和验收要求完成成品检验，并保留相应批次记录。",
  ],
  [
    "按刀型及交付条件执行清洁、刃口防护与包装，标签及批次信息按项目要求管理。",
    "完成清洁、刃口防护、包装和批次标签，降低运输与储存过程中的损伤风险。",
  ],
  [
    "网页素材仅展示作业方式，受控图纸、检验记录及具体工艺参数不公开。",
    "页面仅展示工序概况，不展示客户图纸、检验记录和受控工艺参数。",
  ],
  [
    "漳州基地当前生产环境中的机加工设备列阵、设备加工区域与激光切割设备。",
    "现场照片展示漳州基地的机加工设备、生产区域和激光切割设备。",
  ],
]);

applyReplacements("en/capabilities/index.html", [
  [
    "Process planning aligned with blade geometry, material, drawings and operating requirements.",
    "From material verification and blank shaping to heat treatment, machining, grinding and inspection, the route is defined around the blade, drawing and application.",
  ],
  [
    "Integrated shaping, heat treatment, precision machining, grinding and inspection for geometry, edge and batch requirements.",
    "Manufacturing and inspection focus on mounting interfaces, blade geometry, cutting edges and batch consistency.",
  ],
  [
    "Coordinated blade shaping, heat treatment and downstream grinding according to material, geometry and application requirements, with final parameters set through drawing and technical review.",
    "Blank shaping, heat treatment and downstream grinding are coordinated around the material, blade geometry and application.",
  ],
  [
    "Machining and grinding for straight knives, rotary knives, saw blades and custom parts, with control focused on mounting interfaces, blade geometry and batch repeatability.",
    "Straight knives, rotary knives, saw blades and custom parts are machined and ground with focus on mounting interfaces, blade geometry and batch repeatability.",
  ],
  [
    "Material composition, dimensional, hardness, metallographic and image-measurement inspection for prototype validation, final inspection and batch consistency.",
    "Material composition, dimensions, hardness, metallography and optical measurement support sample validation, final inspection and batch release.",
  ],
  [
    "Real production media from the Zhangzhou base documents the route from incoming material checks to protective packaging, with the exact sequence set by blade geometry, material and approved technical requirements.",
    "Production media from the Zhangzhou base shows the main stages from material verification to protective packaging. The actual route follows blade geometry, material and approved requirements.",
  ],
  [
    "Handheld analysis supports applicable material checks, with final grades and requirements governed by controlled technical documents and inspection records.",
    "Handheld analysis is used to check material, while grade requirements remain controlled by approved technical documents.",
  ],
  [
    "Laser cutting and other blank shaping follow the approved drawing, with later operations planned around geometry and material.",
    "Laser cutting and other blank-shaping operations follow the approved drawing and prepare the part for heat treatment and later machining.",
  ],
  [
    "Blade blanks enter heat treatment through the approved process route, with temperature profiles and detailed parameters kept controlled.",
    "Heat treatment follows the material and blade requirements, with temperature profiles and process parameters controlled internally.",
  ],
  [
    "Machining follows mounting-interface and geometry requirements, with feasible ranges and tolerances confirmed through drawing review.",
    "Machining addresses mounting interfaces, hole patterns and profiles. Achievable tolerances are confirmed through drawing review.",
  ],
  [
    "Applicable grinding forms the cutting edge and critical surfaces, with the route confirmed for each blade geometry and application.",
    "Cutting edges and critical surfaces are ground to suit the blade geometry and application.",
  ],
  [
    "Gauges and inspection equipment verify applicable features during production against the approved drawing and process requirements.",
    "Gauges and inspection equipment verify dimensions and surface requirements at key production stages.",
  ],
  [
    "Finished blades are checked against the approved drawing and acceptance requirements, with applicable batch records retained under control.",
    "Finished blades are inspected against the approved drawing and acceptance criteria, with relevant batch records retained.",
  ],
  [
    "Cleaning, edge protection and packaging follow blade and delivery conditions, with labels and batch information managed to project requirements.",
    "Cleaning, edge protection, packaging and batch labels reduce the risk of damage during transport and storage.",
  ],
  [
    "Media shows working methods without disclosing controlled drawings, inspection records or process parameters.",
    "This page shows the process at a high level without disclosing customer drawings, inspection records or controlled parameters.",
  ],
  [
    "The photographs show machining equipment lines, production equipment and laser-cutting equipment within the current Zhangzhou manufacturing environment.",
    "The photographs show machining equipment, production areas and laser-cutting equipment at the Zhangzhou base.",
  ],
]);

const capabilityCommonChinese = [
  ["工艺与检测支持", "制造与检验重点"],
  [
    "具体工序与检验项目依据刀具类别、材料及验证要求确定。",
    "工序与检验项目根据刀具类别、材料和验收要求确定。",
  ],
  ["图纸、实物样品及使用工况。", "图纸、实物样品或设备工况。"],
  ["材料、刀具几何及制造顺序。", "材料、刀具几何与制造顺序。"],
  ["依据图纸与验收标准执行检验。", "按确认版图纸和验收要求执行检验。"],
  ["样品确认及批量制造放行。", "样品确认后进入批量制造与放行。"],
];

const capabilityCommonEnglish = [
  ["Process and inspection support", "Manufacturing and inspection focus"],
  [
    "The process sequence and inspection items are defined according to blade family, material and validation requirements.",
    "The process sequence and inspection plan follow the blade family, material and acceptance requirements.",
  ],
  ["Drawings, physical samples and operating conditions.", "Drawings, physical samples or documented machine applications."],
  ["Material, geometry and manufacturing sequence.", "Material, blade geometry and manufacturing sequence."],
  ["Inspection against drawings and acceptance criteria.", "Inspection against the approved drawing and acceptance criteria."],
  ["Prototype approval and release for series production.", "Sample approval followed by series production and batch release."],
];

for (const slug of ["heat-treatment", "precision-grinding", "inspection-lab"]) {
  applyReplacements(`capabilities/${slug}/index.html`, capabilityCommonChinese);
  applyReplacements(`en/capabilities/${slug}/index.html`, capabilityCommonEnglish);
}

applyReplacements("capabilities/heat-treatment/index.html", [
  [
    "依据材料、刀具结构及应用要求，评估刀坯成形、热处理与后续研磨的工艺衔接。具体参数以图纸和技术评估结果为准。",
    "根据材料、刀具结构和使用要求衔接刀坯成形、热处理与后续研磨，具体方案通过图纸和项目资料评审确定。",
  ],
]);

applyReplacements("en/capabilities/heat-treatment/index.html", [
  [
    "Blade shaping, heat treatment and downstream grinding are planned together according to material, geometry and application requirements. Final parameters follow drawing and technical review.",
    "Blank shaping, heat treatment and downstream grinding are planned together around the material, blade geometry and application. The final route follows drawing and project review.",
  ],
]);

applyReplacements("capabilities/precision-grinding/index.html", [
  [
    "适用于直刃刀、圆刀、锯片及异型件的机加工与研磨工艺，重点控制安装接口、刀具几何和批次重复性。",
    "面向直刃刀、圆刀、锯片及异型件安排机加工与研磨，重点控制安装接口、刀具几何和批次重复性。",
  ],
]);

applyReplacements("en/capabilities/precision-grinding/index.html", [
  [
    "Machining and grinding processes for straight knives, rotary knives, saw blades and custom parts, with control focused on mounting interfaces, blade geometry and batch repeatability.",
    "Machining and grinding for straight knives, rotary knives, saw blades and custom parts, focused on mounting interfaces, blade geometry and batch repeatability.",
  ],
]);

applyReplacements("quality/index.html", [
  [
    "材料确认、过程检验、尺寸检测与成品检验，依据确认版图纸及相应产品要求执行。",
    "质量控制贯穿材料确认、制造过程和成品放行，检验项目依据确认版图纸与验收要求制定。",
  ],
  [
    "检验方案依据产品、图纸及工况要求制定，覆盖相应的材料、尺寸与刃口标准。",
    "检验方案根据产品、图纸和使用条件制定，重点控制材料、尺寸、刃口与批次一致性。",
  ],
  [
    "确认图纸版本、材料路线及适用的检验要求。",
    "核对图纸版本、材料要求和验收项目。",
  ],
  [
    "在刀坯成形、热处理、机加工及研磨过程中实施相应控制。",
    "在刀坯成形、热处理、机加工和研磨过程中实施过程检验。",
  ],
  [
    "检验已确认的材料、尺寸及刃口要求。",
    "检验已确认的材料、尺寸、安装接口和刃口要求。",
  ],
  [
    "依据确认标准执行产品放行，并保留适用记录。",
    "依据验收要求执行批次放行，并保留相应检验记录。",
  ],
  [
    "以下设备用于相应的来料、过程及成品检验；具体检验方案依据图纸与项目要求确认。",
    "以下设备用于来料、过程和成品检验，具体项目根据图纸与验收要求确定。",
  ],
]);

applyReplacements("en/quality/index.html", [
  [
    "Material verification, in-process inspection, dimensional inspection and final inspection are performed against approved drawings and applicable product requirements.",
    "Quality control covers material verification, manufacturing and final release, with inspection defined by the approved drawing and acceptance criteria.",
  ],
  [
    "Inspection plans are defined according to the product, drawing and operating requirements and cover applicable material, dimensional and edge criteria.",
    "Inspection plans follow the product, drawing and application, with focus on material, dimensions, cutting edges and batch consistency.",
  ],
  [
    "Confirm the drawing revision, material route and applicable inspection requirements.",
    "Review the drawing revision, material requirements and acceptance items.",
  ],
  [
    "Apply controls during blade shaping, heat treatment, machining and grinding.",
    "Perform in-process inspection during blank shaping, heat treatment, machining and grinding.",
  ],
  [
    "Verify the agreed material, dimensional and edge requirements.",
    "Verify the agreed material, dimensions, mounting interfaces and cutting-edge requirements.",
  ],
  [
    "Release products against approved criteria and retain applicable records.",
    "Release each batch against the acceptance criteria and retain the relevant inspection records.",
  ],
  [
    "The equipment below supports applicable incoming, in-process and final inspection. The inspection plan is confirmed for each drawing and project requirement.",
    "The equipment below supports incoming, in-process and final inspection. Specific checks are defined by the drawing and acceptance criteria.",
  ],
]);

applyReplacements("company/index.html", [
  ["集团制造体系下的<br>漳州生产基地", "群新工业漳州生产基地"],
  [
    "群新工业（漳州）有限公司是伟群制刀工业集团成员企业，2024 年 6 月启动漳州生产基地搬迁，延续集团在工业刀具与切削工具领域的制造经验。",
    "群新工业（漳州）有限公司是伟群制刀工业集团成员企业，2024 年 6 月启动漳州生产基地搬迁，开展工业机械刀具制造业务。",
  ],
  ["集团制造体系发展历程", "集团制造体系"],
  [
    "以下照片记录漳州基地的厂区入口、办公及生产楼、生产车间、数控设备区与检测室，展示公司当前生产环境。",
    "现场照片展示漳州基地的厂区入口、办公与生产楼、制造车间、数控设备区和检测室。",
  ],
]);

applyReplacements("en/company/index.html", [
  ["Zhangzhou manufacturing base within the group network", "Qunxin Industrial Zhangzhou manufacturing base"],
  [
    "Qunxin Industrial is a member of Wei Qun Cutting Tools Group. The move to its Zhangzhou manufacturing base began in June 2024, continuing the group’s experience in industrial knives and cutting tools.",
    "Qunxin Industrial is a member of Wei Qun Cutting Tools Group. The move to its Zhangzhou manufacturing base began in June 2024, with a focus on industrial machine-knife manufacturing.",
  ],
  ["Development of the group manufacturing network", "Group manufacturing network"],
  [
    "These photographs document the site entrance, office and production building, manufacturing workshop, CNC equipment area and inspection room at the Zhangzhou base.",
    "The photographs show the site entrance, office and production building, manufacturing workshop, CNC equipment area and inspection room at the Zhangzhou base.",
  ],
]);

applyReplacements("customers/index.html", [
  [
    "相关项目围绕具体设备与切削要求，涵盖刀型匹配、样品验证及批量制造等环节。",
    "项目通常从设备、被处理材料和现有刀具问题开始，经刀具方案确认与样品验证后进入批量制造。",
  ],
  [
    "项目流程涵盖应用信息确认、刀具与工艺确认、样品验证及批量交付。",
    "协作流程覆盖需求确认、刀具方案、样品验证和批量交付。",
  ],
  [
    "确认所属行业、设备类型、被处理材料及当前使用问题。",
    "核对行业、设备类型、被处理材料和当前使用问题。",
  ],
  [
    "确认刀具类型、制造工艺、检验要求及交付范围。",
    "确定刀具结构、制造方案、检验要求和交付范围。",
  ],
  [
    "完成样品验证，并依据确认标准实施批量制造与交付。",
    "完成样品试用与确认后，按验收要求进行批量制造和交付。",
  ],
]);

applyReplacements("en/customers/index.html", [
  [
    "Relevant projects address specific machines and cutting requirements through blade matching, prototype validation and series production.",
    "Projects usually begin with the machine, processed material and current blade issue, then move through blade approval, sample validation and series production.",
  ],
  [
    "The process covers application review, blade and process confirmation, prototype validation and series-production delivery.",
    "The collaboration process covers requirement review, blade planning, sample validation and series delivery.",
  ],
  [
    "Confirm the industry, machine type, processed material and current operating issue.",
    "Review the industry, machine type, processed material and current operating issue.",
  ],
  [
    "Confirm the blade type, manufacturing process, inspection requirements and delivery scope.",
    "Define the blade geometry, manufacturing plan, inspection requirements and delivery scope.",
  ],
  [
    "Validate the prototype and deliver series production against approved criteria.",
    "Complete the sample trial and approval, then manufacture and deliver the series batch against the acceptance criteria.",
  ],
]);

applyReplacements("rfq/index.html", [
  [
    "从现有资料开始即可。完整图纸、实物样品，或明确的设备与工况信息均可用于启动制造评估。",
    "图纸、实物样品、旧刀照片或设备工况均可作为询价起点；工程团队收到资料后进行制造可行性与报价评估。",
  ],
  ["填写技术询价", "提交询价"],
  ["有助于技术评估的资料", "可以提交的项目资料"],
  [
    "可随询价直接上传文件，也可在提交后使用询价编号发送至 rd01@teamstarmfg.com。附件不是必填项。",
    "可在表单中上传文件，也可在提交后注明询价编号发送至 rd01@teamstarmfg.com。附件为选填项。",
  ],
  ["查看完整询价资料指南", "查看完整资料清单"],
  ["提交现有技术资料", "填写现有项目资料"],
  [
    "必填项仅保留用于识别询价与回复联系的必要信息。",
    "填写联系人和项目基本信息，即可提交询价。",
  ],
  [
    "请选择最接近的资料入口，页面会根据现有资料调整填写提示。",
    "选择图纸、样品或工况入口，表单将显示对应问题。",
  ],
  [
    "请填写目前已有的信息，暂不确定的项目可在后续评估中确认。",
    "请填写目前已有的信息，缺失项目可在后续技术沟通中确认。",
  ],
  [
    "请核对以下关键信息。材料牌号、硬度、公差、工艺路线、价格及交期将在技术评估后确认。",
    "提交前请核对联系人、项目类型和附件。材料、硬度、公差、制造方案、价格及交期由工程团队评估。",
  ],
  [
    "提交成功页仍提供邮件入口，可用于补充附件或发送超出限制的大文件。",
    "提交后可使用询价编号通过邮件补充附件或发送超出限制的大文件。",
  ],
  [
    "询价信息及已选附件已经记录。补充资料时请保留以下询价编号；报价与工艺确认前将先进行技术评估。",
    "询价信息和附件已记录。补充资料时请注明以下询价编号；工程团队完成技术评估后再提供制造方案与报价。",
  ],
]);

applyReplacements("en/rfq/index.html", [
  [
    "Start with the information available today. A drawing, physical sample or documented machine and operating condition can each begin a manufacturing review.",
    "A drawing, physical sample, old-blade photograph or documented machine application can each start an enquiry. Our engineering team then reviews manufacturability and quotation requirements.",
  ],
  ["Open the RFQ form", "Submit an RFQ"],
  ["Information that supports review", "Project information you can send"],
  [
    "Files can be uploaded with the RFQ or sent to rd01@teamstarmfg.com using the reference shown after submission. Uploading files is optional.",
    "Upload files with the form or send them later to rd01@teamstarmfg.com with the RFQ reference. File upload is optional.",
  ],
  ["View the complete RFQ preparation guide", "View the complete information checklist"],
  ["Submit the available information", "Enter the project information available"],
  [
    "Required fields are limited to the information needed to identify and reply to the enquiry.",
    "Contact and basic project information are enough to submit the enquiry.",
  ],
  [
    "Choose the closest starting point. The prompts will adapt to the information you have.",
    "Choose drawing, sample or application as the starting point. The form will show the relevant questions.",
  ],
  [
    "Provide the information available today; unknown items can be confirmed during review.",
    "Provide the information available now. Missing details can be confirmed during engineering review.",
  ],
  [
    "Confirm the key information below. Material grade, hardness, tolerance, process route, price and lead time follow technical review.",
    "Before submitting, check the contact, project type and attachments. Material, hardness, tolerances, manufacturing plan, price and lead time follow engineering review.",
  ],
  [
    "The confirmation screen also provides an email option for additional or oversized files.",
    "After submission, use the RFQ reference to send additional or oversized files by email.",
  ],
  [
    "The RFQ and selected files have been recorded. Keep the reference below when sending additional material. Technical review precedes quotation and process confirmation.",
    "The RFQ and attachments have been recorded. Include the reference below when sending more information. Our engineering team completes the technical review before issuing the manufacturing plan and quotation.",
  ],
]);

applyReplacements("rfq/custom-industrial-knife-drawing-checklist/index.html", [
  [
    "完整图纸有助于评估，但不是启动询价的必要条件。实物样品、旧刀照片，或明确的设备与工况资料同样可用于制造评估。",
    "完整图纸有助于加快评估，但不是询价的必要条件。实物样品、旧刀照片或设备工况同样可以作为起点。",
  ],
  ["查看资料准备路径", "查看三种资料路径"],
  [
    "三种路径均进入人工技术评估。暂不确定的项目可在收到询价后识别并进一步确认。",
    "无论从图纸、样品还是工况开始，工程团队都会先核对制造可行性和缺失信息。",
  ],
  [
    "应标识影响安装、切割表现与检验的受控特性。尚未经技术确认的公差或材料要求不应作为确定条件填写。",
    "图纸应标识影响安装、切割表现和检验的关键特性；尚未确认的公差或材料可注明“待评估”。",
  ],
  [
    "附件上传为选填项。补充资料或超出限制的文件可注明询价编号，另行发送至 rd01@teamstarmfg.com。",
    "附件为选填项。补充资料或超出限制的文件可注明询价编号，另行发送至 rd01@teamstarmfg.com。",
  ],
  [
    "报价在技术评估后形成。几何结构、材料、热处理、机加工、研磨及检验要求均可能影响工艺路线与价格。",
    "工程团队根据几何结构、材料、热处理、机加工、研磨和检验要求制定制造方案并核算报价。",
  ],
  [
    "单项制造或检验要求就可能显著改变工艺路线与总成本。人工评估可使报价与实际刀具几何、使用工况及验收要求保持一致。",
    "个别公差、材料或检验要求可能改变制造路线与总成本，因此报价需要结合刀具、工况和验收要求人工评估。",
  ],
]);

applyReplacements("en/rfq/custom-industrial-knife-drawing-checklist/index.html", [
  [
    "A complete drawing is useful but not mandatory. A physical sample, old-blade photographs or documented machine and operating conditions can also start a manufacturing review.",
    "A complete drawing can speed up review, but it is not mandatory. A physical sample, old-blade photographs or documented machine application can also start the enquiry.",
  ],
  ["Review preparation routes", "Review the three information routes"],
  [
    "The three routes lead to the same manual technical review. Unknown items can be identified and confirmed after the enquiry is received.",
    "Whether the enquiry begins with a drawing, sample or application, our engineering team first reviews manufacturability and identifies missing information.",
  ],
  [
    "Mark the characteristics that control fit, cutting performance and inspection. Do not add tolerances or material requirements that have not been technically confirmed.",
    "Mark the characteristics that control fit, cutting performance and inspection. Tolerances or materials not yet confirmed can be labelled “for review”.",
  ],
  [
    "File upload is optional. Additional or oversized files can be referenced by the RFQ number and sent separately to rd01@teamstarmfg.com.",
    "File upload is optional. Send additional or oversized files to rd01@teamstarmfg.com with the RFQ reference.",
  ],
  [
    "Quotation follows technical review. Geometry, material, heat treatment, machining, grinding and inspection requirements can each change the process route and price.",
    "Our engineering team defines the manufacturing plan and quotation from the geometry, material, heat treatment, machining, grinding and inspection requirements.",
  ],
  [
    "A single manufacturing or inspection requirement can materially change the process route and total cost. Manual review keeps the quotation aligned with the actual blade geometry, application and acceptance requirements.",
    "A single tolerance, material or inspection requirement can change the manufacturing route and total cost, so quotation is reviewed against the blade, application and acceptance criteria.",
  ],
]);

for (const file of htmlFiles) {
  write(file, read(file).replace(/[ \t]+$/gm, ""));
}

write(
  "REVIEW_BUILD.txt",
  `Teamstar website review mirror\nVersion: ${version}\nBase path: /teamstar-website-review/\nProduction form submission: disabled in this static review mirror\n`,
);

console.log(`Refined customer-facing copy across ${htmlFiles.length} HTML files; review version ${version}`);
