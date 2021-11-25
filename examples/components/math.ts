import { Vector3Tuple } from "three";

export const vec3Sub = vec3Operator.bind(null, (op1, op2) => op1 - op2);
export const vec3Add = vec3Operator.bind(null, (op1, op2) => op1 + op2);
export const vec3MultScalar = vec3OperatorScalar.bind(null, (op1, op2) => op1 * op2);
export const vec3DivideScalar = vec3OperatorScalar.bind(null, (op1, op2) => op1 / op2);

export function vec3OperatorScalar(
  operator: (op1: number, op2: number) => number,
  op1: Vector3Tuple,
  op2: number,
  result: Vector3Tuple
): Vector3Tuple {
  result[0] = operator(op1[0], op2);
  result[1] = operator(op1[1], op2);
  result[2] = operator(op1[2], op2);
  return result;
}

export function vec3Operator(
  operator: (op1: number, op2: number) => number,
  op1: Vector3Tuple,
  op2: Vector3Tuple,
  result: Vector3Tuple
): Vector3Tuple {
  result[0] = operator(op1[0], op2[0]);
  result[1] = operator(op1[1], op2[1]);
  result[2] = operator(op1[2], op2[2]);
  return result;
}

export function vec3Length(vec3: Vector3Tuple): number {
  return Math.sqrt(vec3[0] * vec3[0] + vec3[1] * vec3[1] + vec3[2] * vec3[2]);
}

export function vec3Copy(from: Vector3Tuple, to: Vector3Tuple): Vector3Tuple {
  if (from != to) {
    to[0] = from[0];
    to[1] = from[1];
    to[2] = from[2];
  }
  return to;
}

export function vec3LimitLength(
  value: Vector3Tuple,
  limit: number,
  result: Vector3Tuple
): Vector3Tuple {
  const length = vec3Length(value);
  if (length > limit) {
    return vec3MultScalar(value, limit / length, result);
  } else {
    return vec3Copy(value, result);
  }
}