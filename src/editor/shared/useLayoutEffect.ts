

import {useEffect, useLayoutEffect} from 'react';
import {CAN_USE_DOM} from './canUseDOM';

const useLayoutEffectImpl: typeof useLayoutEffect = CAN_USE_DOM
  ? useLayoutEffect
  : useEffect;

export default useLayoutEffectImpl;