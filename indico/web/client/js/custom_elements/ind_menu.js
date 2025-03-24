// This file is part of Indico.
// Copyright (C) 2002 - 2025 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

import './ind_menu.scss';
import CustomElementBase from 'indico/custom_elements/_base';

let lastId = 0; // Track the assigned IDs to give each element a unique ID

CustomElementBase.defineWhenDomReady(
  'ind-menu',
  class extends CustomElementBase {
    setup() {
      const trigger = this.querySelector('button');
      const list = this.querySelector('menu');

      console.assert(
        trigger.nextElementSibling === list,
        'The <menu> element must come after <button>'
      );

      trigger.setAttribute('aria-expanded', false);

      list.id = list.id || `dropdown-list-${lastId++}`;
      trigger.setAttribute('aria-controls', list.id);

      trigger.addEventListener('click', () => {
        trigger.setAttribute('aria-expanded', trigger.getAttribute('aria-expanded') !== 'true');
      });

      this.addEventListener('focusout', () => {
        // Delay action as no element is focused immediately after focusout
        requestAnimationFrame(() => {
          if (this.contains(document.activeElement)) {
            return;
          }
          trigger.removeAttribute('aria-expanded');
        });
      });

      this.addEventListener('keydown', evt => {
        if (!trigger.hasAttribute('aria-expanded')) {
          return;
        }
        if (evt.code === 'Escape') {
          trigger.removeAttribute('aria-expanded');
          trigger.focus();
        }
      });
    }
  }
);
