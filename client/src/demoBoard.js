const p00 = { val: 0x11 };
const p10 = { val: 0x12 };
const p20 = { val: 0x13 };
const p21 = { val: 0x23 };
const p22 = { val: 0x33 };
const p23 = { val: 0x43 };
const p33 = { val: 0x44 };
const p43 = { val: 0x45 };
const p24 = { val: 0x53 };
const p2n1 = { val: 0x63 };
const p30 = { val: 0x14 };
const pn10 = { val: 0x15 };
const pn20 = { val: 0x16 };

pn10.left = pn20;
pn20.right = pn10;
p00.left = pn10;
p00.right = p10;
p10.left = p00;
p10.right = p20;
p20.left = p10;
p20.right = p30;
p20.up = p21;
p20.down = p2n1;
p2n1.up = p20;
p21.down = p20;
p21.up = p22;
p22.down = p21;
p22.up = p23;
p23.down = p22;
p23.up = p24;
p23.right = p33;
p33.left = p23;
p33.right = p43;
p43.left = p33;
p24.down = p23;
p30.left = p20;

export const demoMap = new Map();
const mn2 = new Map();
mn2.set(0, pn20);
const mn1 = new Map();
mn1.set(0, pn10);
const m0 = new Map();
m0.set(0, p00);
const m1 = new Map();
m1.set(0, p10);
const m2 = new Map();
m2.set(-1, p2n1);
m2.set(0, p20);
m2.set(1, p21);
m2.set(2, p22);
m2.set(3, p23);
m2.set(4, p24);
const m3 = new Map();
m3.set(0, p30);
m3.set(3, p33);
const m4 = new Map();
m4.set(3, p43);
demoMap.set(-2, mn2);
demoMap.set(-1, mn1);
demoMap.set(0, m0);
demoMap.set(1, m1);
demoMap.set(2, m2);
demoMap.set(3, m3);
demoMap.set(4, m4);

export const demoBoard = p00;
