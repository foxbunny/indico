# This file is part of Indico.
# Copyright (C) 2002 - 2025 CERN
#
# Indico is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see the
# LICENSE file for more details.

from wtforms.fields import BooleanField, EmailField, FileField, SelectField, TextAreaField
from wtforms.validators import DataRequired, Email, InputRequired, Optional, ValidationError

from indico.util.i18n import _, pgettext
from indico.util.placeholders import get_missing_placeholders, render_placeholder_info
from indico.web.forms.base import IndicoForm
from indico.web.forms.fields import IndicoRadioField
from indico.web.forms.validators import NoRelativeURLs, UsedIf
from indico.web.forms.widgets import TinyMCEWidget


class AgreementForm(IndicoForm):
    agreed = IndicoRadioField(_('Do you agree with the stated above?'), [InputRequired()],
                              coerce=lambda x: bool(int(x)), choices=[(1, _('I agree')), (0, _('I disagree'))])
    reason = TextAreaField(_('Reason'))


class AgreementEmailForm(IndicoForm):
    sender_address = SelectField(_('Sender'), [DataRequired()])
    cc_addresses = EmailField(_('CC'), [Optional(), Email()],
                              description=_('Warning: this email address will be able to sign the agreement!'))
    body = TextAreaField(_('Email body'), [NoRelativeURLs()], widget=TinyMCEWidget(absolute_urls=True))

    def __init__(self, *args, **kwargs):
        self._definition = kwargs.pop('definition')
        event = kwargs.pop('event')
        super().__init__(*args, **kwargs)
        self.sender_address.choices = list(event.get_allowed_sender_emails().items())
        self.body.description = render_placeholder_info('agreement-email', definition=self._definition, agreement=None)

    def validate_body(self, field):
        missing = get_missing_placeholders('agreement-email', field.data, definition=self._definition, agreement=None)
        if missing:
            raise ValidationError(_('Missing placeholders: {}').format(', '.join(missing)))


class AgreementAnswerSubmissionForm(IndicoForm):
    answer = IndicoRadioField(pgettext('Agreement answer (noun)', 'Answer'), [InputRequired()],
                              coerce=lambda x: bool(int(x)),
                              choices=[(1, _('Agreement')), (0, _('Disagreement'))])
    document = FileField(_('Document'), [UsedIf(lambda form, field: form.answer.data), DataRequired()])
    upload_confirm = BooleanField(_("I confirm that I'm uploading a document that clearly shows this person's answer"),
                                  [UsedIf(lambda form, field: form.answer.data), DataRequired()])
    understand = BooleanField(_("I understand that I'm answering the agreement on behalf of this person"),
                              [DataRequired()], description=_("This answer is legally binding and can't be changed "
                                                              'afterwards.'))
