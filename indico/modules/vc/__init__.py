# This file is part of Indico.
# Copyright (C) 2002 - 2025 CERN
#
# Indico is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see the
# LICENSE file for more details.

from flask import flash, has_request_context, render_template, session

from indico.core import signals
from indico.modules.events.contributions.models.contributions import Contribution
from indico.modules.events.layout import layout_settings
from indico.modules.events.layout.util import MenuEntryData
from indico.modules.events.sessions.models.blocks import SessionBlock
from indico.modules.users import User
from indico.modules.vc.forms import VCPluginSettingsFormBase
from indico.modules.vc.models.vc_rooms import VCRoom, VCRoomEventAssociation
from indico.modules.vc.plugins import VCPluginMixin
from indico.modules.vc.util import get_managed_vc_plugins, get_vc_plugins
from indico.util.i18n import _
from indico.web.flask.templating import get_overridable_template_name, template_hook
from indico.web.flask.util import url_for
from indico.web.menu import SideMenuItem, TopMenuItem


__all__ = ('VCPluginMixin', 'VCPluginSettingsFormBase', 'VCRoomEventAssociation')


@template_hook('conference-home-info')
def _inject_conference_home(event, **kwargs):
    if not layout_settings.get(event, 'show_vc_rooms'):
        return
    res = VCRoomEventAssociation.find_for_event(event, only_linked_to_event=True)
    event_vc_rooms = [event_vc_room for event_vc_room in res.all() if event_vc_room.vc_room.plugin is not None]
    if event_vc_rooms:
        return render_template('vc/conference_home.html', event=event, event_vc_rooms=event_vc_rooms)


@template_hook('event-header', priority=100)
def _inject_event_header(event, **kwargs):
    res = VCRoomEventAssociation.find_for_event(event, only_linked_to_event=True)
    event_vc_rooms = [event_vc_room for event_vc_room in res.all() if event_vc_room.vc_room.plugin is not None]
    if event_vc_rooms:
        return render_template('vc/event_header.html', event=event, event_vc_rooms=event_vc_rooms)


@template_hook('vc-actions')
def _inject_vc_room_action_buttons(event, item, **kwargs):
    event_vc_room = VCRoomEventAssociation.get_linked_for_event(event).get(item)
    if event_vc_room and event_vc_room.vc_room.plugin:
        plugin = event_vc_room.vc_room.plugin
        name = get_overridable_template_name('vc_room_timetable_buttons.html', plugin, core_prefix='vc/')
        return render_template(name, event=event, event_vc_room=event_vc_room, **kwargs)


@signals.menu.items.connect_via('event-management-sidemenu')
def _extend_event_management_menu(sender, event, **kwargs):
    if not get_vc_plugins():
        return
    if not event.can_manage(session.user):
        return
    return SideMenuItem(
        'videoconference', _('Videoconference'), url_for('vc.manage_vc_rooms', event), section='services'
    )


@signals.event.sidemenu.connect
def _extend_event_menu(sender, **kwargs):
    def _visible(event):
        return bool(get_vc_plugins()) and VCRoomEventAssociation.find_for_event(event).has_rows()

    return MenuEntryData(
        _('Videoconference'), 'videoconference_rooms', 'vc.event_videoconference', position=14, visible=_visible
    )


@signals.event.contribution_deleted.connect
@signals.event.session_block_deleted.connect
def _link_object_deleted(obj: Contribution | SessionBlock, **kwargs):
    assocs = list(obj.vc_room_associations)
    for event_vc_room in assocs:
        # tie the room to the event instead
        signals.vc.vc_room_detached.send(event_vc_room, vc_room=event_vc_room.vc_room, old_link=obj, event=obj.event)

        event_vc_room.link_object = obj.event

        signals.vc.vc_room_attached.send(
            event_vc_room, vc_room=event_vc_room.vc_room, event=obj.event, data={}, old_link=obj
        )

    if not assocs:
        return

    if isinstance(obj, Contribution):
        message = _('There was a videoconference associated with this contribution. It has been linked to the event '
                    'instead')
    else:
        message = _('There was a videoconference associated with this session block. It has been linked to the event '
                    'instead')
    flash(message, 'warning')


@signals.event.session_deleted.connect
def _session_deleted(sess, **kwargs):
    for block in sess.blocks:
        _link_object_deleted(block)


@signals.event.deleted.connect
def _event_deleted(event, **kwargs):
    user = session.user if has_request_context() and session.user else User.get_system_user()
    for event_vc_room in VCRoomEventAssociation.find_for_event(event, include_hidden=True, include_deleted=True):
        event_vc_room.delete(user)


@signals.menu.items.connect_via('top-menu')
def _topmenu_items(sender, **kwargs):
    if not session.user or not get_managed_vc_plugins(session.user):
        return
    return TopMenuItem('services-vc', _('Videoconference'), url_for('vc.vc_room_list'), section='services')


@signals.event_management.get_cloners.connect
def _get_vc_cloner(sender, **kwargs):
    from indico.modules.vc.clone import VCCloner

    return VCCloner


@signals.users.merged.connect
def _merge_users(target, source, **kwargs):
    VCRoom.query.filter_by(created_by_id=source.id).update({VCRoom.created_by_id: target.id})
