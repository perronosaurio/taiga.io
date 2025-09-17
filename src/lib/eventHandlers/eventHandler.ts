function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export class EventHandler
{
  title : string = '';
  color : number = 0x0;
  diffFields : any[] = [];
  extraFields: any[] = [];
  descFields: any[] = [];

  COLORS = {
    CREATE: 0x00ff00,  // Green
    DELETE: 0xff0000,  // Red
    CHANGE: 0xffff00,  // Yellow
    CLOSE: 0xdadadc,   // Gray
    COMMENT: 0x7289da  // Sky blue
  }

  clearFields() {
    this.title = '';
    this.color = 0x0;
    this.diffFields = [];
    this.extraFields = [];
    this.descFields = [];
  }

  handleEvent(body: any) {
    this.clearFields()

    const type:string = this.getBodyTypeStr(body);

    switch (body.action) {
      case 'create':
        this.title = `Created ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.CREATE
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

    this.createExtraFields(body)
    this.sortExtraFields()

    this.createDescFields(body)

    return {
      ...this.createBaseEmbed(body, this.title, this.color),
      fields: [
        ...this.diffFields,
        ...this.extraFields,
        ...this.descFields
      ]
    }
  }

  createBaseEmbed(body:any, title: string, color: number) {
    let changer = body.by;
    let img = changer.photo==null?null:changer.photo.split('?')[0];

    return {
      author: {
        icon_url: changer?.photo ? img : undefined,
        name: `${changer.username} (${changer.full_name})`,
        url: `${changer.permalink}`
      },
      color: color,
      timestamp: body.date,
      title: title,
      url: body.data.permalink
    }
  }

  createDiffFields(body: any) {
    if(body.action != 'change') return;

    this.diffFields = []
    const type = this.getBodyTypeStr(body);

    if (body.change?.diff?.subject || body.change?.diff?.name) {
      const from = body.change?.diff?.subject?.from || body.change?.diff?.name?.from || 'Unknown'
      const to = body.change?.diff?.subject?.to || body.change?.diff?.name?.to || 'Unknown'
      this.diffFields.push({
        name: '📝 Name',
        value: `${from} → ${to}`
      })
    }

    if (body.change?.diff?.due_date) {
      let from = body.change.diff.due_date.from
      let to = body.change.diff.due_date.to

      to==null?to:formatDate(to)
      from==null?to:formatDate(from)

      this.diffFields.push({
        name: '📅 Due date',
        value: `${from} → ${to}`,
      })
    }

    if (body.change?.diff?.is_blocked) {
      const status = body.change.diff.is_blocked.to;
      
      this.title = `${status==true?`Blocked`:`Unblocked`} ${type} #${body.data.ref}: ${body.data.subject}`
    }

    if (body.change?.diff?.status) {
      this.title = `Updated status on ${type} #${body.data.ref}: ${body.data.subject}`

      this.diffFields.push({
        name: '📊 Status',
        value: `${body.change.diff.status.from} → ${body.change.diff.status.to}`,
      })
      if(body.change.diff.status.to == 'Closed')
      {
        this.color = this.COLORS.CLOSE;
      }
    }

    if (body.change?.comment) {

      if (body.change.delete_comment_date != null) {
        this.title = `Delete comment on ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.DELETE
      }
      else if (body.change.edit_comment_date != null) {
        this.title = `Update comment on ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.CHANGE
      }
      if (body.change.edit_comment_date == null && body.change.delete_comment_date == null) {
        this.title = `New comment on ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.COMMENT
      }
      this.diffFields.push({
        name: '💭 Comment',
        value: body.change.comment
      })
    }

    if(body.change?.diff?.attachments)
    {
      let attachments:any = ''
      let file:any = '', fileUrl:any = ''

      if(body.change.diff.attachments.deleted.length != 0) {
        this.title = `Delete attachment on ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.DELETE
        attachments = body.change.diff.attachments.deleted
      }
      else if(body.change.diff.attachments.changed.length != 0) {
        this.title = `Change attachment on ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.CHANGE
        attachments = body.change.diff.attachments.changed
      }
      else if(body.change.diff.attachments.new.length != 0) {
        this.title = `New attachment on ${type} #${body.data.ref}: ${body.data.subject}`
        this.color = this.COLORS.CREATE
        attachments = body.change.diff.attachments.new
      }

      for(let i of attachments)
      {
        file = i.filename
        fileUrl = i.url
      }

      this.diffFields.push({
        name: '📁 Attachment',
        value: `[${file}](${fileUrl})`
      })
    }
  }

  createExtraFields(body: any) {
    this.extraFields = []

    if (body.data.project) {
      this.extraFields.push(
        {
          name: '📚 Project',
          value: `[${body.data.project.name}](${body.data.project.permalink})`,
          inline: true
        },
      )
    }
    if (body.data?.user_story) {
      this.extraFields.push({
        name: '📝 User Story',
        value: `[${body.data.user_story.subject}](${body.data.user_story.permalink})`,
        inline: true
      })
    }
    if (body.data?.milestone) {
      this.extraFields.push({
        name: '🏃 Sprint',
        value: `[${body.data.milestone.name}](${body.data.milestone.permalink})`,
        inline: true
      })
    }
    if (body.data?.status.name) {
      this.extraFields.push({
        name: '📊 Status',
        value: body.data.status.name,
        inline: true
      })
    }

    if (body.data?.due_date != null){
      let date = formatDate(body.data?.due_date);
      this.extraFields.push({
        name: '📅 Due date',
        value: `${date}`,
        inline: true
      })
    }

    if (body.data?.assigned_to != null) {
      this.extraFields.push({
        name: '👥 Assigned To',
        value: `[${body.data.assigned_to.full_name}](${body.data.assigned_to.permalink})`,
        inline: true
      })
    }
    if (body.data?.tags && body.data?.tags.length > 0) {
      this.extraFields.push({
        name: '🏷️ Tags',
        value: body.data.tags.join(', '),
        inline: true
      })
    }

    if (body.data?.is_blocked) {
      this.extraFields.push({
        name: '⚠️ Blocked',
        value: `**Note**: ${body.data.blocked_note}`,
        inline: false
      })
    }

    if (body.data?.team_requirement)
    {
      this.extraFields.push({
        name: 'Team Requirement',
        value: '⬆️',
        inline: true
      })
    }

    if (body.data?.client_requirement)
    {
      this.extraFields.push({
        name: 'Client Requirement',
        value: '⬆️',
        inline: true
      })
    }

  }

  sortExtraFields()
  {
    this.extraFields.sort((a,b) => {
      const aValue = a.inline === false?1:0;
      const bValue = b.inline === false?1:0;
      return aValue-bValue
    });
  }

  createDescFields(body: any)
  {
    this.descFields = []

    if (body.data.description) {
      this.descFields.push({
        name: '📄 Description',
        value: body.data.description
      })
    }
  }

  getBodyTypeStr(body:any)
  {
    let type : string = '';

    switch(body?.type)
    {
      case 'epic': type = 'Epic'; break;
      case 'userstory': type = 'User Story'; break;
      case 'task': type = 'Task'; break;
      case 'issue' : type = 'Issue'; break;
      case 'milestone' : type = 'Scrum'; break;
    }

    return type;
  }
}