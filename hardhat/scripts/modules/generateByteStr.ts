import { randomBytes } from 'crypto';

/**
 * 指定されたバイト数（約）のURLセーフなランダム文字列を生成します。
 * @param byteLength 生成したい文字列のおおよそのバイト数
 * @returns Base64URLエンコードされたランダム文字列
 */
export function generateByteStr(byteLength: number): string {
	// Base64は3バイトのバイナリデータを4文字のテキストに変換するため、
	// 目的のバイト数に3/4を掛けた数のランダムバイトを生成します。
	const requiredBytes = Math.floor(byteLength * (3 / 4));

	return randomBytes(requiredBytes)
		.toString('base64url'); // base64urlエンコーディングを使用
}