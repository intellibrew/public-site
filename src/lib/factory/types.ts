import type * as THREE from "three";

export type ConveyorPath = {
  points: THREE.Vector3[];
  cumulative: number[];
  length: number;
};
export type ConveyorMover = {
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  path: ConveyorPath;
  speed: number;
  offset: number;
  lastPathT?: number;
};
export type ConveyorBeltSegment = {
  beltMaterial: THREE.MeshStandardMaterial;
  rollers: THREE.Mesh[];
  scrollSign: number;
};
export type BeltRig = {
  segments: ConveyorBeltSegment[];
  travelRate: number;
  rollerRate: number;
};
export type QcRig = {
  rejectPusher: THREE.Group;
  scannerHead: THREE.Group;
  scanBeam: THREE.Mesh;
  scanLines: THREE.Mesh[];
  passStrip: THREE.Mesh;
  hmiScreen: THREE.Mesh;
  greenLamp: THREE.Mesh;
  amberLamp: THREE.Mesh;
  redLamp: THREE.Mesh;
  scanLight: THREE.PointLight;
  rejectLight: THREE.PointLight;
  branchPulse?: THREE.Mesh;
};
export type ProductShape = { width: number; height: number; depth: number };
export type IntakeRig = {
  carrier: THREE.Group;
  carrierLoad: THREE.Mesh;
  liftTable: THREE.Group;
  scanBeam: THREE.Mesh;
  intakePulse: THREE.Mesh;
  feederRollers: THREE.Mesh[];
  coilStack: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
};
export type BlankingRig = {
  ramAssembly: THREE.Group;
  hydraulics: THREE.Mesh[];
  stripFeed: THREE.Group;
  dieGlow: THREE.Mesh;
  dieBlank: THREE.Mesh;
  gateGlows: THREE.Mesh[];
  beacon: THREE.Mesh;
  statusStrip: THREE.Mesh;
  impactLight: THREE.PointLight;
};
export type StampingRig = {
  ramAssembly: THREE.Group;
  hydraulics: THREE.Mesh[];
  feedStrip: THREE.Group;
  stationMarkers: THREE.Mesh[];
  knockOut: THREE.Group;
  dieGlow: THREE.Mesh;
  stampedPart: THREE.Mesh;
  sideGlow: THREE.Mesh;
  guardGlow: THREE.Mesh;
  feedPulse: THREE.Mesh;
  beacon: THREE.Mesh;
  statusStrip: THREE.Mesh;
  impactLight: THREE.PointLight;
};
export type RobotJointPose = {
  yaw: number;
  shoulder: number;
  elbow: number;
  wrist: number;
  grip: number;
  carry: number;
};
export type SubAssemblyRig = {
  baseYaw: THREE.Group;
  shoulder: THREE.Group;
  elbow: THREE.Group;
  wrist: THREE.Group;
  gripperLeft: THREE.Mesh;
  gripperRight: THREE.Mesh;
  transferPart: THREE.Mesh;
  sourcePulse: THREE.Mesh;
  targetPulse: THREE.Mesh;
  sourceStagingPart: THREE.Mesh;
  targetStackParts: THREE.Mesh[];
};
export type WeldingRig = {
  torchCarriage: THREE.Group;
  needle: THREE.Group;
  weldArc: THREE.Mesh;
  sparkCore: THREE.Mesh;
  sparkHalo: THREE.Mesh;
  sparkFlecks: THREE.Mesh[];
  seamGlow: THREE.Mesh;
  sparkLight: THREE.PointLight;
  statusBeacon: THREE.Mesh;
  windowGlows: THREE.Mesh[];
  smokeWisps: THREE.Mesh[];
};
export type PaintBoothRig = {
  sprayNozzles: THREE.Mesh[];
  sideSprayCones: THREE.Mesh[];
  exhaustRings: THREE.Mesh[];
  indicator: THREE.Mesh;
  sprayLight: THREE.PointLight;
  uvBar: THREE.Mesh;
  beacon: THREE.Mesh;
};
export type FinalAssemblyRig = {
  gantryCarriage: THREE.Group;
  gantrySlide: THREE.Group;
  robotBaseYaw: THREE.Group;
  robotShoulder: THREE.Group;
  robotElbow: THREE.Group;
  robotWrist: THREE.Group;
  robotGripperL: THREE.Mesh;
  robotGripperR: THREE.Mesh;
  workPulses: THREE.Mesh[];
  beaconMeshes: THREE.Mesh[];
  assemblyLight: THREE.PointLight;
};
export type PackagingRig = {
  sealHead: THREE.Group;
  gantryCrane: THREE.Group;
  statusBeacon: THREE.Mesh;
  amberLamp: THREE.Mesh;
  sealBeam: THREE.Mesh;
  packingLight: THREE.PointLight;
  palletALayers: THREE.Mesh[];
  palletBLayers: THREE.Mesh[];
  inboundProduct: THREE.Mesh;
  outboundRollers: THREE.Mesh[];
  labelLights: THREE.Mesh[];
  craneHome: THREE.Vector3;
  cranePick: THREE.Vector3;
  sealHomeY: number;
  sealDownY: number;
};
export type LayoutPoint = { x: number; y: number };

export type RevealStep = {
  group: THREE.Group;
  start: number;
  end: number;
};

export type LightRig = {
  overheadLights: THREE.PointLight[];
  overheadLenses: THREE.MeshStandardMaterial[];
  key: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  skylight: THREE.DirectionalLight;
  hallFill: THREE.PointLight;
  backWallGlow: THREE.PointLight;
  hemisphere: THREE.HemisphereLight;
  ambient: THREE.AmbientLight;
};
