const { coef, partrans } = require("./helpers");
const { dmeasureInternal } = require("./dmeasureInternal.js");
const { trajectory } = require("./trajectoryInternal.js");

exports.trajMatchObjfun  = function (object, params, est, transform = false, args) {
  return tmofInternal(
    object=object,
    params=params,
    est=est,
    transform=transform,
    args
  )
}

const tmofInternal = function (object, params, est, transform, args) {

  ep = "in traj.match.objfun : "
  
  if (!est) est = [];

  if (Object.keys(params).length === 0) params = coef(object);
  
  // if ((!is.numeric(params))||(is.null(names(params))))
  //   throw new Error(ep+ "'params' must be a named numeric vector");
  if (transform) {
    params = partrans(object, params, dir = "toEstimationScale");
  }
    
  // it does match(est,names(params))??? Maybe replace by object later
  let parEstIdx = []; 
  for (let i = 0; i < est.length; i++) {
    for (let j = 0; j < Object.keys(params).length; j++) {
      if(est[i] === Object.keys(params)[j]) parEstIdx.push(j);
    }
  }

  if (parEstIdx.some(a => {return a === NaN}))
    throw new Error(ep + "est does not match with parameters")

  return  (par) => {
    let d;
    if (parEstIdx.length > 0) {
      for (let i = 0; i < parEstIdx.length; i++) {
        params[Object.keys(params)[parEstIdx[i]]]= par[Object.keys(params)[parEstIdx[i]]];
      }
    } 
    
    if (transform) tparams = partrans(object, params, dir="fromEstimationScale");
    
    let x = trajectory(
      object,
      params = transform? tparams : params,
      args
    )
    d = dmeasureInternal(
      object,
      y=object.data,
      x,
      times = object.times,
      params = transform? tparams : params,
      log = true
    )
    return -d.reduce((a, b) => a + b, 0);
  }
}
