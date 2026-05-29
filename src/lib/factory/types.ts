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
  scanBeam: THREE.Mesh;
  greenLamp: THREE.Mesh;
  redLamp: THREE.Mesh;
  branchPulse: THREE.Mesh;
  rejectLight: THREE.PointLight;
};
export type ProductShape = { width: number; height: number; depth: number };
export type IntakeRig = {
  carrier: THREE.Group;
  carrierLoad: THREE.Mesh;
  liftTable: THREE.Group;
  scanBeam: THREE.Mesh;
  intakePulse: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
};
export type BlankingRig = {
  ramAssembly: THREE.Group;
  hydraulics: THREE.Mesh[];
  dieGlow: THREE.Mesh;
  dieBlank: THREE.Mesh;
  gateGlows: THREE.Mesh[];
  beacon: THREE.Mesh;
  statusStrip: THREE.Mesh;
};
export type StampingRig = {
  ramAssembly: THREE.Group;
  dieGlow: THREE.Mesh;
  stampedPart: THREE.Mesh;
  sideGlow: THREE.Mesh;
  guardGlow: THREE.Mesh;
  feedPulse: THREE.Mesh;
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
  chillerFan: THREE.Mesh;
  statusBeacon: THREE.Mesh;
  windowGlows: THREE.Mesh[];
  smokeWisps: THREE.Mesh[];
};
export type PaintBoothRig = {
  sprayNozzles: THREE.Mesh[];
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
