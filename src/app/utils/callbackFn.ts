export const callbackFn = (fn: any, data: any) => {
    if (typeof fn === 'function') {
      fn(data);
    }
    return;
  };