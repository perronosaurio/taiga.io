import {EventHandler} from './eventHandler';

export class EpicHandler extends EventHandler
{
  title : string = '';
  color : number = 0x0;
  diffFields : any[] = [];
  extraFields: any[] = []
  descFields: any[] = []
}
