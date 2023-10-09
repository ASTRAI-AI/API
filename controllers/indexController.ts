import { Request, Response } from 'express';

class IndexController {

  public async index(req: Request, res: Response) {
    res.send("Online")
    //res.json({ data: data });
  }

}

export const indexController = new IndexController();