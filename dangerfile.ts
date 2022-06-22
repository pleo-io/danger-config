import { danger, fail, markdown, message, warn } from "danger";

// Setup
const github = danger.github;
const pr = github.pr;
const commits = github.commits;
const modified = danger.git.modified_files;

let willShowGuidelines = false

if (github.issue.labels.length === 0) {
  const comment = `This PR is not labeled.`;
  message(comment);
  willShowGuidelines = true
}

// No PR is too small to warrant a paragraph or two of summary.
if (pr.body.length === 0) {
  const comment = `This PR does not include a description.`;
  fail(comment);
  willShowGuidelines = true
}

// PRs have a proper title.
if (pr.title.length < 4) {
  const comment = `This PR does not have descriptive title.`;
  warn(comment);
  willShowGuidelines = true
}

// PRs should be small.
const bigPRThreshold = 500;
if (github.pr.additions + github.pr.deletions > bigPRThreshold) {
  const comment = `This PR has more than ${bigPRThreshold} changes.`;
  warn(comment);
  willShowGuidelines = true
}

//PRs should include tests for changes.
const hasModifiedTests = modified.some((f) => f.match(/test/));
if (hasModifiedTests !== true) {
  const comment = `This PR does not add or modify tests.`;
  warn(comment);
  willShowGuidelines = true

  if (
    github.requested_reviewers.teams.length > 0 ||
    github.requested_reviewers.users.length > 0
  ) {
    const secondComment = `This PR has assigned reviewers, but does not add tests.`;
    message(secondComment);
  }
}

if (commits.some((i) => i.commit.message.length < 3)) {
  const comment = `This PR has commits with short or non-descriptive messages.`;
  message(comment);
  willShowGuidelines = true
}

const teamReviewersThreshold = 2;
if (github.requested_reviewers.teams.length > teamReviewersThreshold) {
  const comment = `This PR has more than ${teamReviewersThreshold} teams assigned.`;
  warn(comment);
  willShowGuidelines = true
}

const userReviewersThreshold = 3;
if (github.requested_reviewers.users.length > userReviewersThreshold) {
  const comment = `This PR has more than ${userReviewersThreshold} individual reviewers assigned.`;
  warn(comment);
  willShowGuidelines = true
}

if (github.requested_reviewers.users.length === 0 || github.requested_reviewers.teams.length === 0) {
  const comment = `This PR has no assigned reviewers.`;
  message(comment);
  willShowGuidelines = true
}

if (willShowGuidelines) {
  const message = `❤️ Good work!
  
  📚 If you are in wondering why these messages appear, [check out our PR guidelines](https://www.notion.so/pleo/PR-and-Code-Review-Culture-at-Pleo-220324344eb849f3b636cd00a28b4a41)!
  
  ---
  
  📄 _Guidelines are defined in [our Dangerfile](https://github.com/pleo-io/danger-config/blob/master/dangerfile.ts). Reach out to [#engprod-devexp](https://getpleo.slack.com/archives/C030H8BMU8K) on Slack for questions._
  
  `
  markdown(message);
}
