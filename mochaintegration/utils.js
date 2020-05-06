function propexistencechecker (thingy, propname) {
  if (!(propname in thingy)) {
    console.error('problematic', thingy);
    throw new Error(propname+' does not exist in the object');
  }
}
function checkPropertiesOn (thingy, propnamearry) {
  if (!lib.isVal(thingy)) {
    console.error('problematic', thingy);
    throw new Error('Bad Thingy');
  }
  if (!lib.isArray(propnamearry)) {
    console.error(propnamearry, 'is not an Array');
    throw new Error('Bad property name array');
  }
  propnamearry.forEach(propexistencechecker.bind(null, thingy));
}

setGlobal('checkPropertiesOn', checkPropertiesOn);
