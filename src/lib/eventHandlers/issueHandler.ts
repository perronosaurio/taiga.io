
import {EventHandler} from './eventHandler';

export class IssueHandler extends EventHandler
{
  title : string = '';
  color : number = 0x0;
  diffFields : any[] = [];
  issueFields : any[] = [];
  extraFields: any[] = [];
  descFields: any[] = [];

  handleEvent(body: any) {
    this.clearFields()
    // console.log(body);
    // console.log(JSON.stringify(body.change, null, 2))

    const type:string = this.getBodyTypeStr(body);

    switch (body.action) {
      case 'create':
        this.title = `Created ${type} #${body.data.ref}: ${body.data.subjec}`
        this.color = parseInt(body.data.priority.color,16)
        break
      case 'delete':
        this.title = `Deleted ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.DELETE
        break
      case 'change':
        this.title = `Updated ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.CHANGE
        break
    }

    this.createDiffFields(body)
    this.createIssueFields(body)
    this.createExtraFields(body)
    this.createDescFields(body)

    return {
      ...this.createBaseEmbed(body, this.title, this.color),
      fields: [
        ...this.diffFields,
        ...this.issueFields,
        ...this.extraFields,
        ...this.descFields
      ]
    }
  }

  createIssueFields(body: any)
  {
    this.issueFields = [];
    const issue = body.data;

    if (issue?.type)
    {
      this.issueFields.push({
          name: '⚠️ Type',
          value: issue.type.name,
          inline: true
      })
    }
    if (issue?.priority) {
      this.issueFields.push({
      name: '🔴 Priority',
        value: issue.priority.name,
          inline: true
      })
    }
    if (issue?.severity)
    {
      this.issueFields.push({
        name: '⚡ Severity',
          value: issue.severity.name,
            inline: true
      })
    }
  }
}