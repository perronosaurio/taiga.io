import {EventHandler} from './eventHandler';

export class TaskHandler extends EventHandler
{
  title : string = '';
  color : number = 0x0;
  diffFields : any[] = [];
  extraFields: any[] = []
  descFields: any[] = []

  createExtraFields(body: any) {
    this.extraFields = [];
    super.createExtraFields(body);

    if (body.data?.is_iocaine) {
      this.extraFields.push({
        name: '💊 Iocaine',
        value: 'Yes',
        inline: true
      })
    }
  } 
}