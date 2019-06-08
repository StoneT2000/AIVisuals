//Implementation of Rand Index or Rand measure to measure similarity between two data clusters
function randIndex(trueLabels, predLabels) {
  let a,b;
  a=0;
  b=0;
  // a: pairs of elements in the same subset in trueLabels and predLabels
  // b: pairs of elements in differenent subset in both labellings
  // c: same subset in trueLabels, diff in predLabels
  // d: diff subset in trueLabels, same in predLabels
  // We return (a + b) / (a+b+c+d) = (a + b) / ((n)(n-1)/2), giving the Rand Index
  
  let n = trueLabels.length;
  for (let i = 0; i < n; i++) {
    let e1 = trueLabels[i];
    let f1 = predLabels[i];
    for (let j = 0; j < n && i != j; j++) {
      //for every pair of elements, add them to values a,b,c,d
      let e2 = trueLabels[j];
      let f2 = predLabels[j];
      //console.log(e1,e2,f1,f2);
      if (e1.label === e2.label && f1.label === f2.label) {
        a += 1;
      }
      else if (e1.label != e2.label && f1.label != f2.label) {
        b += 1;
      }
    }
  }
  return (a + b) / ((n)*(n-1) / 2);
}