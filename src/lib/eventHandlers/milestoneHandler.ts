
import {EventHandler} from './eventHandler';

export class MilestoneHandler extends EventHandler
{
  title : string = '';
  color : number = 0x0;
  diffFields : any[] = [];
  extraFields: any[] = []
  descFields: any[] = []

  handleEvent(body: any) {
    console.log(body);
    console.log(JSON.stringify(body.change, null, 2))

    const type:string = this.getBodyTypeStr(body);

    switch (body.action) {
      case 'create':
        this.title = `Created ${type} : ${body.data.name}`
        this.color = this.COLORS.CREATE
        break
      case 'delete':
        this.title = `Deleted ${type} : ${body.data.name}`
        this.color = this.COLORS.DELETE
        break
      case 'change':
        this.title = `Updated ${type} : ${body.data.name}`
        this.color = this.COLORS.CHANGE
        break
    }

    // this.createDiffFields(body)
    // this.createExtraFields(body)
    // this.createDescFields(body)

    return {
      ...this.createBaseEmbed(body, this.title, this.color),
      fields: [
        ...this.diffFields,
        ...this.extraFields,
        ...this.descFields
      ]
    }
  }
}