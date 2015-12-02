'use strict';

const React = require('react');

module.exports = React.createFactory(function renderResume(props) {
  return React.DOM.article(
    { className: 'resume' },
    Name({ name: props.name }),
    Links({ links: props.links }),
    Markdown({ md: props.summary, className: 'summary' }),
    WorkExperience({ jobs: props.workExperience }),
    Teaching({ schools: props.teaching }),
    Education({ schools: props.education })
  );
});

/* Markdown Renderer */
const md = new (require('remarkable'))({typographer: true});
const Markdown = React.createFactory(function renderMarkdown(props) {
  let markup = { __html: md.render(props.md) };
  return React.DOM.div({ className: props.className, dangerouslySetInnerHTML: markup });
});

/* Name Renderer */
const Name = React.createFactory(function renderName(props) {
  return React.DOM.h1({}, props.name);
});

const objMap = (obj, fn) => Object.keys(obj).map( (key) => fn(obj[key], key, obj) );

/* Links Renderer */
const URL = require('url');

const Links = React.createFactory(function renderLinks(props) {
  let links = objMap(props.links, (url, key) => Links__Link({ url: url, type: key, key: key }) );
  return React.DOM.ul({ className: 'links' }, links);
});

const Links__Link = React.createFactory(function renderLink(props) {
  let match = props.url.match(/^\w+:(?:\/\/)?(.*)$/);
  let display = match ? match[1] : props.url;
  let anchor = React.DOM.a({ href: props.url }, display);
  return React.DOM.li({className: props.type}, anchor);
});

/* Work Experience Renderer */
const moment = require('moment');
const inputDateFormat = 'YYYY-MM';
const displayDateFormat = "MMM YYYY"

const WorkExperience = React.createFactory(function renderWorkExperience(props) {
  let jobs = props.jobs
    .sort((a,b) => moment(b.to, inputDateFormat) - moment(a.to, inputDateFormat))
    .map( (job, key) => WorkExperience__Job({job: job, key: key}) );

  return React.DOM.ol({ className: 'work-experience' }, jobs);
});

const WorkExperience__Job = React.createFactory(function renderJob(props) {
  let job = props.job;
  let company = WorkExperience__Company({ url: job.url }, job.company);
  let title = WorkExperience__Title({}, job.title);
  let dates = TimeSpan({ from: job.from, to: job.to });
  let description = job.description && Markdown({ className: 'description', md: job.description });
  let tech = job.technologies && TechStack({ stack: job.technologies });
  return React.DOM.li({}, company, title, dates, description, tech);
});

const WorkExperience__Company = React.createFactory(function renderCompany(props) {
  return React.DOM.div({ className: 'company' }, props.url ? React.DOM.a({ href: props.url }, props.children) : props.children);
});

const WorkExperience__Title = React.createFactory(function renderTitle(props) {
  return React.DOM.h2({ className: 'title' }, props.children);
});

const TimeSpan = React.createFactory(function renderDates(props) {
  return React.DOM.div(
    { className: 'time-span' },
    TimeSpan__Date({ className: 'from', dateTime: props.from }),
    TimeSpan__Date({ className: 'to',   dateTime: props.to })
  );
});

const TimeSpan__Date = React.createFactory(function renderDate(props) {
  let formatted = moment(props.dateTime, inputDateFormat).format(displayDateFormat);
  return React.DOM.time({className: props.className, dateTime: props.dateTime }, formatted)
})

const TechStack = React.createFactory(function renderTechStack(props) {
  let techItems = props.stack
    .map( (tech, i) => TechStack__TechItem({tech: tech, key: i}) );
  return React.DOM.ul({className: 'tech'}, techItems);
});

const cssify = (function() {
  const unsafe = /[^a-z0-9]/g;
  const pair = /([a-z])([A-Z])/g;
  return function cssify(name) {
    return name
      .replace(pair, unpair)
      .toLowerCase()
      .replace(unsafe, safe);
  };

  function unpair(_, p1, p2) { return p1 + ' ' + p2.toLowerCase(); }
  function safe(s) {
    if (s === ' ') return '-';
    return '__u' + s.charCodeAt(0);
  }
})();

const TechStack__TechItem = React.createFactory(function renderTechItem(props) {
  let content = props.tech.url
    ? React.DOM.a({ href: props.tech.url }, props.tech.name)
    : props.tech.name;
  return React.DOM.li({ className: cssify(props.tech.name) }, content);
});

const Teaching = React.createFactory(function renderTeaching(props) {
  let schools = props.schools.map( (s, key) => Teaching__Item({ school: s, key: key }) );
  return React.DOM.ol({ className: 'teaching' }, schools);
});

const Teaching__Item = React.createFactory(function renderTeachingItem(props) {
  let name = React.DOM.div({ className: 'school' }, props.school.organization);
  let title = React.DOM.h2({ className: 'title' }, props.school.title);
  let dates = TimeSpan({from: props.school.from, to: props.school.to });
  let notes = props.school.notes && Markdown({ md: props.school.notes, className: 'notes' });
  return React.DOM.li({}, name, title, dates, notes);
});

const Education = React.createFactory(function renderTeaching(props) {
  let schools = props.schools.map( (s, key) => Education__Item({ school: s, key: key }) );
  return React.DOM.ol({ className: 'education' }, schools);
});


const Education__Item = React.createFactory(function renderTeachingItem(props) {
  let name = React.DOM.div({ className: 'school' }, props.school.school);;
  let program = React.DOM.h2({ className: 'program' }, props.school.program);
  let dates = TimeSpan({from: props.school.from, to: props.school.to });
  let notes = props.school.notes && Markdown({ md: props.school.notes, className: 'notes' });
  return React.DOM.li({}, name, program, dates, notes);
});

