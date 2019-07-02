function propexistencechecker (thingy, propname) {
  if (!(propname in thingy)) {
    console.error(thingy);
    throw new Error(propname+' does not exist in the object');
  }
}
function checkPropertiesOn (thingy, propnamearry) {
  if (!lib.isVal(thingy)) {
    console.error(thingy);
    throw new Error('Bad Thingy');
  }
  if (!lib.isArray(propnamearry)) {
    throw new Error('Bad property name array');
  }
  propnamearry.forEach(propexistencechecker.bind(null, thingy));
}

setGlobal('checkPropertiesOn', checkPropertiesOn);