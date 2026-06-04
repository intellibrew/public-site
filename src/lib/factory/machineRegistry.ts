import * as THREE from "three";

export type MachineSpec = { label: string; value: string };
export type MachineMetric = { label: string; value: number; unit: string; max: number };

export type MachineDefinition = {
  id: string;
  name: string;
  codename: string;
  tagline: string;
  description: string;
  bottleneck: string;
  process: string;
  material: string;
  takt: string;
  upstream: string;
  downstream: string;
  capabilities: string[];
  specs: MachineSpec[];
  metrics: MachineMetric[];
  focus: {
    cameraOffset: THREE.Vector3;
    targetOffset: THREE.Vector3;
  };
};

export const MACHINE_DEFINITIONS: MachineDefinition[] = [
  {
    id: "intake",
    name: "Material Intake",
    codename: "NODE-01 / INBOUND",
    tagline: "Coil decoiling, straightening & staged feed",
    description:
      "Inbound steel coils are decoiled, straightened, and advanced as a continuous strip into the line. This station maintains uninterrupted material feed to sustain downstream process continuity.",
    bottleneck: "Coil changeover averages 18 min dead time. Dock scheduling conflicts between shifts are the leading cause of queue depth spikes upstream of the blanking press.",
    process: "Decoil · straighten · servo feed",
    material: "HSLA / mild steel coil",
    takt: "18 m/min max feed",
    upstream: "Dock receipt",
    downstream: "Blanking press",
    capabilities: ["9-roll straightener", "Hydraulic mandrel", "AC servo feed", "Loop photocontrol"],
    specs: [
      { label: "Coil weight", value: "≤ 15 T" },
      { label: "Strip width", value: "600-1,600 mm" },
      { label: "Strip thickness", value: "0.8-4.0 mm" },
      { label: "Feed accuracy", value: "±0.1 mm" },
    ],
    metrics: [
      { label: "Feed speed", value: 14, unit: "m/min", max: 18 },
      { label: "Queue depth", value: 11, unit: "coils", max: 20 },
      { label: "Straightener load", value: 72, unit: "%", max: 100 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(2.4, 2.6, 2.2),
      targetOffset: new THREE.Vector3(0, 0.55, 0),
    },
  },
  {
    id: "blanking",
    name: "Blanking Press",
    codename: "NODE-02 / BLANK",
    tagline: "400 T hydraulic shear blanking",
    description:
      "A 400-ton hydraulic press executes shear blanking on the incoming strip, separating flat panels to defined geometry. Each blank is produced to nominal dimensions and tolerance before transfer to the forming stations.",
    bottleneck: "Clearance drift past 10% per side triggers a burr-height inspection hold. A sharpening cycle takes ~35 min and is the single largest planned-downtime event on this node.",
    process: "Hydraulic shear blanking",
    material: "Flat strip 0.8-4.0 mm",
    takt: "3.3 s / stroke · 18 SPM",
    upstream: "Material intake",
    downstream: "Stamping cell",
    capabilities: ["Full-stroke tonnage", "Variable stroke length", "Die clearance monitor", "Burr-height vision check"],
    specs: [
      { label: "Rated tonnage", value: "400 T" },
      { label: "Stroke rate", value: "18 SPM" },
      { label: "Die clearance", value: "7% t/side" },
      { label: "Blank tolerance", value: "±0.1 mm" },
    ],
    metrics: [
      { label: "Press force", value: 387, unit: "T", max: 400 },
      { label: "Die hit count", value: 847, unit: "k hits", max: 1000 },
      { label: "OEE", value: 91.8, unit: "%", max: 100 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(2.0, 2.4, 1.8),
      targetOffset: new THREE.Vector3(0, 0.7, 0),
    },
  },
  {
    id: "stamping",
    name: "Stamping Cell",
    codename: "NODE-03 / STAMP",
    tagline: "6-station progressive die forming",
    description:
      "Blanked panels are processed through a six-station progressive die, executing pierce, form, and trim operations in sequence. Exiting panels are fully formed and released to sub-assembly.",
    bottleneck: "Pilot pin wear causes registration error > 0.08 mm, triggering misfeed. Stock lifter timing is the first tuning point - a worn lifter delays strip release by ~12 ms and buckles the web at high SPM.",
    process: "Progressive die forming",
    material: "Blanked sheet panel",
    takt: "2.7 s / stroke · 22 SPM",
    upstream: "Blanking press",
    downstream: "Sub-assembly",
    capabilities: ["Conical pilot registration", "In-die misfeed sensor", "Quick die change (QDC)", "Strip utilisation monitor"],
    specs: [
      { label: "Stations", value: "6 (progressive)" },
      { label: "Pitch per stroke", value: "42 mm" },
      { label: "Position tolerance", value: "±0.05 mm" },
      { label: "Strip utilisation", value: "76%" },
    ],
    metrics: [
      { label: "Strokes/min", value: 22, unit: "SPM", max: 30 },
      { label: "Die temperature", value: 68, unit: "°C", max: 120 },
      { label: "First-pass yield", value: 97.6, unit: "%", max: 100 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(1.8, 2.2, 1.6),
      targetOffset: new THREE.Vector3(0, 0.65, 0),
    },
  },
  {
    id: "subAssembly",
    name: "Sub-Assembly",
    codename: "NODE-04 / SUB-A",
    tagline: "6-axis robotic fastening cell",
    description:
      "Six-axis robots retrieve stamped panels and perform orientated fastening with specified hardware. The cell delivers repeatable joint placement and torque-controlled assembly within defined cycle time.",
    bottleneck: "Pneumatic bowl-feeder jams account for ~3 stoppages per shift, each costing 90 s. Root cause is M8 nut flash exceeding 0.15 mm - a supplier dimensional tolerance issue, not a machine fault.",
    process: "Robotic pick · orient · fasten",
    material: "Stamped panel + M6-M10 hardware",
    takt: "94 s / assembly cycle",
    upstream: "Stamping cell",
    downstream: "Welding station",
    capabilities: ["F/T sensor at TCP", "Compliant insertion", "Hot-swap tray feed", "Torque traceability log"],
    specs: [
      { label: "Reach", value: "1.4 m" },
      { label: "TCP repeatability", value: "±0.02 mm" },
      { label: "Torque range", value: "12-65 Nm (M6-M10)" },
      { label: "F/T sensor", value: "300 N · 30 Nm" },
    ],
    metrics: [
      { label: "Torque OK rate", value: 99.8, unit: "%", max: 100 },
      { label: "Arm utilisation", value: 78, unit: "%", max: 100 },
      { label: "Feeder jams", value: 3, unit: "/shift", max: 10 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(1.6, 2.0, 1.5),
      targetOffset: new THREE.Vector3(0, 0.5, 0),
    },
  },
  {
    id: "welding",
    name: "Welding Station",
    codename: "NODE-05 / WELD",
    tagline: "GMAW spray-transfer seam welding",
    description:
      "Automated GMAW cells join sub-assembled frames with controlled seam deposition along designated joints. Process parameters and shielding gas delivery ensure consistent weld quality across the production run.",
    bottleneck: "Contact tip wear extends CTWD past 26 mm, raising arc voltage, increasing spatter, and plugging the nozzle. Nozzle cleanup takes ~8 min. Tip replacement schedule is now condition-based (arc voltage trend), not time-based.",
    process: "GMAW spray-transfer seam weld",
    material: "Sub-assembled steel chassis",
    takt: "42 s / seam pass",
    upstream: "Sub-assembly",
    downstream: "Paint booth",
    capabilities: ["Spray-transfer MAG", "CTWD closed-loop", "Seam-tracking laser", "Fume extraction"],
    specs: [
      { label: "Wire / process", value: "1.2 mm ER70S-6 / GMAW" },
      { label: "Shielding gas", value: "C25 · 16 L/min" },
      { label: "Parameters", value: "240 A · 27 V" },
      { label: "Heat input", value: "~1.1 kJ/mm" },
    ],
    metrics: [
      { label: "Arc stability", value: 96.4, unit: "%", max: 100 },
      { label: "Gas flow", value: 16, unit: "L/min", max: 20 },
      { label: "Spatter index", value: 4, unit: "/m weld", max: 15 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(1.7, 2.1, 1.7),
      targetOffset: new THREE.Vector3(0, 0.6, 0),
    },
  },
  {
    id: "paint",
    name: "Paint Booth",
    codename: "NODE-06 / COAT",
    tagline: "Electrostatic 2K polyurethane coating",
    description:
      "Assemblies undergo surface preparation, electrostatic coating, and controlled bake in an enclosed spray booth. Uniform film build and cure profile define the finished surface specification for downstream release.",
    bottleneck: "Substrate temperature delta > 8 °C between parts entering the booth causes fisheye and cratering. A thermal soak zone upstream equalises part temperature to 22 ± 2 °C before spray entry.",
    process: "Zn-phosphate · electrostatic 2K coat · bake",
    material: "Welded steel assembly",
    takt: "25 min bake + 8 min spray",
    upstream: "Welding station",
    downstream: "QC inspection",
    capabilities: ["Electrostatic rotary atomiser", "Zn-phosphate pretreat", "Cross-draft 0.35 m/s", "Inline film thickness gauge"],
    specs: [
      { label: "Coating", value: "2K polyurethane" },
      { label: "Dry film build", value: "90-110 µm" },
      { label: "Bake cycle", value: "160 °C × 25 min" },
      { label: "Transfer efficiency", value: "85% (electrostatic)" },
    ],
    metrics: [
      { label: "Film thickness", value: 102, unit: "µm", max: 120 },
      { label: "Humidity", value: 55, unit: "%RH", max: 100 },
      { label: "Defect rate", value: 1.4, unit: "%", max: 10 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(1.5, 1.8, 1.4),
      targetOffset: new THREE.Vector3(0, 0.45, 0),
    },
  },
  {
    id: "qualityCheck",
    name: "QC Inspection",
    codename: "NODE-07 / QC",
    tagline: "Inline vision · pass / reject gate",
    description:
      "Each unit is dimensionally verified against engineering datums at this inline gate. Conforming parts advance to final assembly; non-conforming units are rejected to containment for disposition.",
    bottleneck: "Lens contamination drops scan confidence below 92%, triggering false rejects at ~2.1%. Lens wipe is scheduled every 4 h; unplanned wipes cost ~6 min each.",
    process: "Structured-light scan · pass/reject gate",
    material: "Coated assembly unit",
    takt: "0.8 s / unit",
    upstream: "Paint booth",
    downstream: "Final assembly",
    capabilities: ["Structured-light scan", "12-point datum check", "Pneumatic reject pusher", "Pass/reject stack lights"],
    specs: [
      { label: "Scan method", value: "Structured light" },
      { label: "Datum points", value: "12 / unit" },
      { label: "Pass tolerance", value: "±0.3 mm" },
      { label: "Cycle time", value: "0.8 s" },
    ],
    metrics: [
      { label: "Pass rate", value: 97.9, unit: "%", max: 100 },
      { label: "Scan confidence", value: 94.2, unit: "%", max: 100 },
      { label: "False reject", value: 2.1, unit: "%", max: 10 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(1.4, 1.6, 1.3),
      targetOffset: new THREE.Vector3(0, 0.55, 0),
    },
  },
  {
    id: "finalAssembly",
    name: "Final Assembly",
    codename: "NODE-08 / FINAL",
    tagline: "Gantry + floor robot integration cell",
    description:
      "Coated chassis and kit components are integrated across four sequential work zones using servo gantry and robotic assembly. All remaining fasteners are applied and verified before unit completion.",
    bottleneck: "Torque audit failures generate a rework loop averaging +1.8 min per unit. Pre-kitted sub-assemblies and Fieldbus torque traceability are reducing this - the target is < 0.4% rework rate by Q3.",
    process: "Gantry + robot multi-zone assembly",
    material: "Coated chassis + kit parts",
    takt: "4.2 min / unit",
    upstream: "QC inspection",
    downstream: "Packaging line",
    capabilities: ["Servo gantry ±0.1 mm", "DC transducer tooling", "12 poka-yoke/zone", "Fieldbus torque log"],
    specs: [
      { label: "Gantry span", value: "3.0 m" },
      { label: "Torque range", value: "15-250 Nm · ±2%" },
      { label: "Work zones", value: "4" },
      { label: "Takt time", value: "4.2 min" },
    ],
    metrics: [
      { label: "Assembly OK", value: 99.3, unit: "%", max: 100 },
      { label: "Gantry speed", value: 1.2, unit: "m/s", max: 2 },
      { label: "Rework rate", value: 0.7, unit: "%", max: 5 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(2.2, 2.5, 2.0),
      targetOffset: new THREE.Vector3(0.8, 0.7, -0.5),
    },
  },
  {
    id: "packaging",
    name: "Packaging Line",
    codename: "NODE-09 / PACK",
    tagline: "Heat-seal, palletise & GS1 label",
    description:
      "Completed assemblies are heat-sealed, unitised, palletised, and marked with traceability labels for outbound logistics. Units released from this station are cleared for dispatch.",
    bottleneck: "Print contrast falling below 80% AIM barcode grade causes inline verifier rejects. Each reprint adds ~45 s per pallet. Cause: thermal printhead wear - now replaced at 800k label cycles, not on failure.",
    process: "Heat-seal · stretch wrap · GS1 label",
    material: "Finished assembly unit",
    takt: "60 s / unit · 30/pallet",
    upstream: "Final assembly",
    downstream: "Dispatch dock",
    capabilities: ["Impulse heat seal", "200% stretch wrap", "±0.5 g checkweigher", "GS1-128 SSCC inline verify"],
    specs: [
      { label: "Seal conditions", value: "180 °C · 0.4 MPa · 2.5 s" },
      { label: "Peel strength", value: "≥ 18 N / 15 mm" },
      { label: "Pallet standard", value: "GMA 1200 × 1000 mm" },
      { label: "Stack", value: "6 layers · 30 units" },
    ],
    metrics: [
      { label: "Seal integrity", value: 99.8, unit: "%", max: 100 },
      { label: "Pallet fill", value: 88, unit: "%", max: 100 },
      { label: "Label pass rate", value: 97.4, unit: "%", max: 100 },
    ],
    focus: {
      cameraOffset: new THREE.Vector3(2.0, 2.3, 1.9),
      targetOffset: new THREE.Vector3(0, 0.8, 0),
    },
  },
];

export const MACHINE_MAP = new Map(MACHINE_DEFINITIONS.map((m) => [m.id, m]));

export const CLICKABLE_STATION_IDS = MACHINE_DEFINITIONS.map((m) => m.id);
