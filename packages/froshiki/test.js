const hoge = 1;

const {
  a,
  b: c,
  d: { e },
  f: [g],
  ...h
} = {};

function func() {
  console.log(hoge);
}

class Hoge {}
