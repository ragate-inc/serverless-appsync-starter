import jwt, { JwtPayload } from 'jsonwebtoken';

export default class {
  private static _secretKey = `${process.env.SERVICE as string}-${process.env.REGION as string}`;

  /**
   * Decoding NextToken
   * @param token \
   */
  public static verify = (token: string): Promise<JwtPayload | null> =>
    new Promise((resolve) => {
      jwt.verify(token, this._secretKey, function (err, decoded) {
        if (err) resolve(null);
        else resolve(decoded as JwtPayload);
      });
    });

  /**
   * Encoding of NextToken
   * @param payload
   */
  public static sign = (payload: string | Buffer | object): string => jwt.sign(payload, this._secretKey);
}
