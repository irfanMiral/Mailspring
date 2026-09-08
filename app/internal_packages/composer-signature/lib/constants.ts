import crypto from 'crypto';
import URL from 'url';
import { localized } from 'mailspring-exports';
import ReactDOMServer from 'react-dom/server';
import Templates from './templates';

export const DataShape = [
  {
    key: 'name',
    label: localized('Name'),
  },
  {
    key: 'title',
    label: localized('Title'),
  },
  {
    key: 'phone',
    label: localized('Phone'),
  },
  {
    key: 'email',
    label: localized('Email Address'),
  },
  {
    key: 'fax',
    label: localized('Fax'),
  },
  {
    key: 'address',
    label: localized('Address'),
  },
  {
    key: 'websiteURL',
    label: localized('Website'),
  },
  {
    key: 'facebookURL',
    label: localized('Facebook URL'),
  },
  {
    key: 'linkedinURL',
    label: localized('LinkedIn URL'),
  },
  {
    key: 'mediumURL',
    label: localized('Medium Handle'),
  },
  {
    key: 'githubURL',
    label: localized('GitHub Username'),
  },
  {
    key: 'youtubeURL',
    label: localized('YouTube'),
  },
  {
    key: 'twitterHandle',
    label: localized('Twitter Handle'),
  },
  {
    key: 'instagramURL',
    label: localized('Instagram URL'),
  },
  {
    key: 'tintColor',
    label: localized('Theme Color'),
    placeholder: 'ex: #419bf9, purple',
  },
];

export const ResolveSignatureData = (data: Record<string, string>) => {
  data = { ...data };

  ['websiteURL', 'facebookURL', 'youtubeURL'].forEach((key) => {
    if (data[key] && !data[key].includes(':')) {
      data[key] = `http://${data[key]}`;
    }
  });

  // If the user already entered a full URL (e.g. a custom short-link redirect
  // rather than a bare username), trust it as-is instead of trying to rebuild
  // a linkedin.com/twitter.com/etc URL out of it.
  const isFullURL = (value: string) => /^[a-z][a-z0-9+.-]*:\/\//i.test(value);

  // sanitize linkedin handle
  if (data.linkedinURL) {
    if (!isFullURL(data.linkedinURL)) {
      data.linkedinURL = `https://www.linkedin.com/in/${data.linkedinURL}`;
    }
  }

  // sanitize medium handle
  if (data.mediumURL) {
    if (!isFullURL(data.mediumURL)) {
      if (!data.mediumURL.startsWith('@')) {
        data.mediumURL = `@${data.mediumURL}`;
      }
      data.mediumURL = `https://www.medium.com/${data.mediumURL}`;
    }
  }

  // sanitize github username
  if (data.githubURL) {
    if (!isFullURL(data.githubURL)) {
      data.githubURL = `https://www.github.com/${data.githubURL}`;
    }
  }
  // sanitize twitter handle - resolved to a full URL here (rather than left as a bare
  // handle) so a full custom URL passes through untouched, matching the other fields.
  if (data.twitterHandle) {
    if (!isFullURL(data.twitterHandle)) {
      let handle = data.twitterHandle;
      if (handle.includes('/')) {
        // a bare url (no scheme) was likely entered, e.g. "twitter.com/user" - grab the user.
        const split = handle.split('/');
        handle = split[split.length - 1];
      }
      if (handle[0] === '@') {
        // an at symbol was added, lets remove it.
        handle = handle.slice(1);
      }
      data.twitterHandle = `https://twitter.com/${handle}`;
    }
  }

  if (data.photoURL === 'gravatar') {
    const hash = crypto
      .createHash('sha256')
      .update((data.email || '').toLowerCase().trim())
      .digest('hex');
    data.photoURL = `https://www.gravatar.com/avatar/${hash}/?s=160&msw=160&msh=160`;
  }

  if (data.photoURL === 'company') {
    const domain =
      (data.websiteURL && URL.parse(data.websiteURL).hostname) ||
      (data.email && data.email.split('@').pop());
    data.photoURL = `https://logo.getmailspring.com/company-logo/${domain}?msw=128&msh=128`;
  }

  if (data.photoURL === 'custom') {
    data.photoURL = '';
  }

  if (data.instagramURL) {
    if (!data.instagramURL.includes('instagram.com')) {
      data.instagramURL = `https://www.instagram.com/${data.instagramURL}`;
    }
  }

  return data;
};

export function RenderSignatureData(data: Record<string, string>) {
  const template = Templates.find((t) => t.name === data.templateName) || Templates[0];
  return ReactDOMServer.renderToStaticMarkup(template(ResolveSignatureData(data)));
}
