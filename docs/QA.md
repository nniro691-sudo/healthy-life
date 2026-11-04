# 山寺交付检查

## 视觉方向

参考视频：38.17 秒，656×1280。抽帧确认了背面小和尚、佛殿行走、连续跪拜、木鱼自动敲击和 108 颗念珠计数。

设计参考：`temple-concept.png`，1536×1024，由内置 imagegen 生成。场景资产通过内置工具生成，保存在 `public/assets/`；运行时无外部字体或图片依赖。

主提示词方向：完整的沉浸式中国寺庙修行应用；深色木构、金色佛像、石板通路、山景和暖色灯笼；背面小和尚；左侧四场景、底部四修行方式及右下路线；米金文字与深色半透明控件。佛殿资产从参考图移除所有 UI 与人物；山门、庭院和许愿树生成独立无字场景。

## 浏览器验证

使用内置 IAB 浏览器与真实页面操作，没有使用 Playwright 独立浏览器回退。验证过默认视口、实际 CSS 390×844 手机视口和1536×1024 桌面视口（与参考图原生尺寸一致）。浏览器截图工具因缩放返回额外右侧及底部画布，最终预览裁掉了该空白，保留完整实际视口。临时视口已恢复。

已通过 `view_image` 对照参考图、桌面截图及手机截图，检查了以下项目：

| 项目 | 对照结果与处理 |
|---|---|
| 场景构图 | 保留居中的金色佛像、前景石板路、左右红柱与山景；手机按高度居中裁切 |
| 配色与材质 | 米金文字、深木和暖金场景、半透明深色操作区；调整角色灯光避免过曝 |
| 字体 | 使用宋体 / 系统中文衬线字体，独立设置标题、操作和辅助文案尺寸 |
| 容器与位置 | 左侧场景导航、底部浮动操作栏和右下路线；手机场景栏收为图标，保留辅助名称 |
| 图标 | 合掌、跪拜、木鱼和寺庙采用专门线性图标；修正自定义图标数据结构错误并复测 |
| 响应式 | 390×844 下主操作完整，弹窗可滚动；修复聚焦弹窗后场景容器滚动造成的顶部裁切 |
| 文案 | 四场景与四修行方式顺序保持；新增路线说明、状态文案、今日记录与设置属于功能扩展 |
| 素材 | 四张独立本地场景，无界面文字烘焙；压缩为 JPEG，合计约 3.5 MB |

## 功能检查

- 木鱼连续手动点击累计；勾选自动敲击后计数继续增加，关闭面板后停止。
- 念珠按钮连续点击从 0 到 2，珠子位置更新；按 108 颗取余，支持手势。
- 合掌激活状态、动作与次数；再次点击结束。
- 跪拜激活后按完整动作计数；停止后回到站立状态。
- 四场景导航、回到佛殿、路线面板和完整漫游已操作；完整漫游结束时显示完成提示。
- 许愿树选择“家人安康”并保存，出现成功提示；刷新后记录中仍有 1 个心愿。
- 刷新后修行记录恢复，示例木鱼 8 次、念珠 2 次保留。
- 已点击三维地面验证行走，状态更新为“随心而行，步步安然”；键盘移动使用同一角色状态。路径坐标限制在可行走地面，靠近镜头时限制角色位置，避免被底栏挡住。
- 清净模式勾选后侧栏隐藏；画质切换流畅 / 精细正常，关闭设置后顶部栏仍保持 y=20px。
- 构建：`npm run build` 通过；源文件语法检查通过。

## 有意的实现区别

这是可操作的 2.5D 网页原型。完整背景保持参考视觉，人物采用简洁的实时三维模型；服装细节与参考图的写实人物存在差异。角色与地面有透视移动和实时阴影，建筑背景不是完整三维模型。环顾仅为轻微平移，不支持完整 360° 绕行。

设置、修行记录、许愿、完整漫游属于补全使用流程的功能。全部真实界面元素由 HTML/CSS/JS 构建，不用截图代替可操作控件。未发布至外网、未封装微信小程序或原生安装包。总体构图、场景素材和控制布局已经按参考方向完成视觉核验，角色写实程度不声称为逐像素一致。

## 2026-11-03 人物与动作修订

- 将人物独立为 `src/monk.js`，重做头身比例、下颌、耳廓、眉眼、领口、袖口、腰带、布鞋及可变形衣褶。
- 使用统一地面坐标的髋、肩、肘、腕、膝、踝定位，跪拜周期改为 6.4 秒，分屈膝、伏身、停留、起身四段。
- 双脚前后位置在跪拜过程中锁定；鞋底高度随鞋旋转修正；衣袍上沿跟随躯干，下摆保持在地面以上，避免腰部断开。
- 站立、合掌、跪拜、行走之间用平滑姿态混合，取消整体身体下移和硬复位。
- 背景和三维层使用相同像素平移及缩放；点击坐标反算变换后的画布尺寸，避免视差与点击偏移。
- 修复点击地面时状态回调会取消行走的问题；跪拜次数改由完整动画循环回调累计。
- `node --test tests/monk.test.mjs`：逐帧检查完整跪拜 385 帧，所有网格顶点保持在地面以上；结束回到站姿，切换动作时人物根坐标不变。
- IAB 浏览器检查过合掌、跪拜、恢复站立和随后点击行走；控制台没有运行错误。保存的 `monk-bow-fixed.jpg` 为实际跪拜截图。

## 2026-11-03 拜垫、圆滑衣袖与多人在线

- 移除背后黄色肩带、结扣、垂带和黄色腰圈。手臂使用沿肩肘腕路径生成的连续曲面衣袖，避免上下臂硬接缝。
- 佛殿按 5 列 × 3 排布置 15 个实时三维软垫，包含圆角、厚度、包边与表面纹饰。拜垫与角色共用相机透视、地面坐标和视角变换。
- 点击拜垫后角色走至预定脚位，抬高至垫面，面向佛像参拜；合掌 / 跪拜按钮会选择最近的空闲垫。拜垫也支持键盘焦点选择。
- 新增 Node 房间服务，使用 SSE 下发匿名角色状态、同源 POST 上报动作。每个浏览器标签页是独立真实用户；没有假在线人数或填充 NPC。
- 服务器校验房间、会话凭证、动作、坐标、拜垫占用；每房间上限 24 个连接。此限制是容量配置，并不代表已完成 24 人性能压测。
- 浏览器双连接实测：人数从 1 变为 2；一个用户点击第 12 号拜垫，另一用户显示该垫被占用；另一用户使用第 13 号垫，两端均可看见对方礼佛。远端显示状态读取为 `mode=bow, mat=mat-12`。
- `multiplayer-preview.jpg` 为两个独立浏览器连接同时在线的实机截图；截图保存后测试连接会关闭，页面人数按真实连接数回落。
- 邀请面板实测返回本机局域网地址 `http://192.168.52.11:5173/?room=mountain-temple`。公网尚未部署，异地用户需要访问共同部署的 Node 服务。
- `npm test` 通过四项：完整跪拜的地面接触、动作切换不移动根坐标、15 个拜垫的透视拾取、双连接同步 / 抢垫冲突 / 离线释放 / 错误凭证拒绝。
- `npm run build` 通过。生产入口 `PORT=5174 npm start` 启动后，页面及房间接口均返回 200；检查后该临时生产进程已停止，开发预览继续运行于 5173。
- 静态 dist 不再足以独立提供多人功能，部署方法已更新于 README。当前为单进程内存房间，跨实例同步及公网部署不在本次完成范围。

## 2026-11-04 全景三维空间与人物精修

本节取代此前 2.5D 场景范围说明。

- `src/temple.js` 构建连续三维佛殿、庭院、山门、许愿树、地面、屋顶和柱梁。佛龛保留图像纹理面板与体积造型组合；不把整张场景图片当作空间。
- OrbitControls 提供真实 360° 环顾与缩放，镜头随人物平移；新增视角复位、左右环顾及屏幕方向按钮。方向键 / WASD 相对当前镜头前后移动。
- 人物与拜垫默认缩放为前版 72%。参拜区扩为 8 × 8 共 64 个拜垫，保留中央通路；远端角色使用较低细分并降低动作更新频率。
- 肩部起点移入胸背，胸肩上沿改为连续曲面，袖管从零半径平滑展开；缩小头部比例，细化掌形与手指。人物仍为风格化造型，不声称扫描级或影视写实。
- 墙体边界、树干避让、由侧庭进入佛殿时经过入口的走位已加入。走入不同区域后标题自动更新。镜头侧转时限制到墙内，避免近处墙柱充满画面。
- 石材和木纹使用程序化表面纹理；静态建筑按材质合并，自动检查确认建筑绘制网格在 100 个以内。
- Mac 解锁后 IAB 实测：正面 → 左侧 → 背面环顾，背面能看到山门、庭院和人物正面；向前走按钮正常触发相对视角移动，观察到三维场景与相邻角色的相对位置变化。
- `npm test` 六项全部通过：64 垫透视拾取、整轮跪拜不穿地、动作切换根坐标稳定、四区域/墙边/树干/入口走位、合并后三维建筑、双连接动作及新空间坐标同步和占用冲突。
- 服务端坐标范围随新空间扩大，连接上限改为 64；满员帧率未压测。仍需同一运行服务，公网未部署。

## 2026-11-04 上香、问候、三维器物与室外素材

- 新增“上香”按钮：人物走至香案前，持三炷香、齐眉礼敬，并有飘散烟雾。动作约 7.2 秒，完成后累计；其他同修同步看到 incense 动作。
- 点击附近同修的名字或三维人物可合十问候，人物转向对方而非固定朝佛像。对方收到可关闭的问候通知，并可回礼。服务端校验身份、对象、距离及频率。
- 独立 IAB 房间 `qa-rituals` 的双页面实测收到问候通知并成功点击回礼，原发起人随后收到对方的问候；不是本地假提示。
- 上香实机完成两次，记录分别加一，并显示“上香已完成，愿你自在安然”。模型顶点检查覆盖完整上香动作，无穿地或非有限坐标。
- 木鱼换为三维器物，包含细木纹、漆面反光、口缝、木柄及连接正确的木槌。手动与自动敲击均已操作，计数和木槌反馈正常，可拖动观察。
- 念珠换为三维木珠、绳线、母珠与穗子。珠子按椭圆弧长均匀分布，避免顶部拥挤，并沿环形路径持续流转。拨动产生额外位移；自动持念按节奏计数，纯展示流转不增加次数。
- 新器物面板关闭时释放独立 WebGL 渲染器、几何、材质及定时器。自动木鱼 / 自动持念在关闭面板后停止。
- 室外以全景图替代简单山体背景，松树从球形树冠改为枝干与透明松枝贴图。已检查庭院反向环顾画面，过近叶片淡出，镜头在树冠附近降低高度，避免大枝叶贴脸遮挡。
- 保存实机图：`woodfish-preview.jpg`、`beads-preview.jpg`、`greeting-preview.jpg`、`garden-panorama-preview.jpg`。主界面仍保留 64 个拜垫与连续三维行走。
- 内置浏览器视口设置未作用于隐藏测试页，所保存的器物截图实际为桌面 1280×720；不将其冒称手机实测。本次保留了手机响应式样式，临时视口设置已恢复。

### 室外素材与生成方式

使用内置 imagegen。生成后复制到本项目，山林图压缩为 JPEG，松枝保留 PNG 透明通道。运行时不调用生成服务。

- `public/assets/mountain-panorama.jpg`：完整 360° 等距柱状山林全景，2:1；远处中国山岭、松林与薄雾，晨间暖光，天空约占上半幅，无人物、无文字，左右边缘衔接，作为真实三维建筑背后的远景。
- `public/assets/pine-canopy.png`：单簇不规则中国松枝，细密针叶、小枝干和自然透光空隙，真正透明背景，无树干和地面，用于三维树冠的交叉叶片。

主提示词：

> A full 360 degree equirectangular latitude-longitude panorama, 2:1 aspect ratio. Peaceful lush Chinese mountain landscape, distant misty limestone ridges, natural mature pine trees, subtle autumn ginkgo warmth, soft morning golden sunlight, blue gray sky and wispy clouds. Horizon near mid-height; upper half mostly sky, lower half distant land with no close obstructions. Left and right edges seamlessly join. No text, UI or people.

> One irregular airy cluster of realistic Chinese pine branches with delicate dark and medium green needles, small woody twigs and natural sunlit highlights. Many gaps and transparent holes between needles, asymmetrical spreading canopy. No trunk, no ground; genuinely transparent background. No text, no logo, not a round ball.

### 2026-11-04 — Grand sanctuary and cross-body walking
- Reviewed the supplied video at 2 seconds: central golden Buddha, paired side shrines and a dark ceremonial hall informed the revision.
- Rebuilt the interior with thicker vermilion columns, tiered gilded capitals, enclosed lattice galleries, lotus coffers, an octagonal caisson, paired sculpted attendants and a layered central shrine surround. Added dressed interior stone and aisle inlays; navigation bounds and 64 mats remain unchanged.
- Fixed same-side gait by reversing elbow and wrist swing relative to the leg on that side. Added named hand/foot rig nodes and a complete-cycle regression asserting opposite-side coordination, accounting for the shoe's fixed toe offset.
- Browser QA in isolated room `qa-grand-hall`: hall renders, forward movement and kneeling controls respond. Final capture: `docs/grand-hall-preview.jpg`.
- `npm test`: 9/9 pass, including bow floor contact, walking coordination, incense, mat picking and multiplayer. `npm run build`: pass (existing Three.js chunk-size advisory remains).
