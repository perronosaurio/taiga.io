import {EventHandler} from './eventHandler';

export class UserStoryHandler extends EventHandler
{
  title : string = '';
  color : number = 0x0;
  diffFields : any[] = [];
  extraFields: any[] = []
  descFields: any[] = []

  createDiffFields(body: any): void {
    if(body.action != 'change') return;

    this.diffFields = [];
    const type = this.getBodyTypeStr(body);

    super.createDiffFields(body);

    if(body?.change?.diff?.points)
    {
      this.title = `Updated points on ${type} #${body.data.ref}: ${body.data.subject}`
    }
  }

  createExtraFields(body: any) {
    this.extraFields = [];
    super.createExtraFields(body);

    const userStory = body.data;

    if (userStory.points && userStory.points.length > 0) {
      let values = userStory.points
          .filter((p: any) => p.value != null)
          .filter((p: any) => p.value != 0)
          .map((p: any) => `${p.role}: ${p.value}`)

      if(values.length > 0) 
      {
        this.extraFields.push({
          name: '🎯 Points',
          value: values.join('\n'),
          inline: true
        })
      }
    }

  }
}