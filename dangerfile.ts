import { danger, fail, markdown, message, warn } from "danger";

// Setup
const github = danger.github;
const pr = github.pr;
const commits = github.commits;
const modified = danger.git.modified_files;

const willShowGuidelines = false

if (github.issue.labels.length === 0) {
  const comment = `This PR is not labeled.
  
  If this repository is released using our [🚤 Automated Release workflow](https://www.notion.so/pleo/Automated-Releases-235f7cab8e034e74bba375ef7e9caf7c), labels are required in order to ship a release.`;
  message(comment);
  willShowGuidelines = true
}

// No PR is too small to warrant a paragraph or two of summary.
if (pr.body.length === 0) {
  const comment = `This PR does not include a description.
  
  Giving PRs even a short description makes it easier for reviewers to contextualize the changes in the PR.`;
  fail(comment);
  willShowGuidelines = true
}

// PRs have a proper title.
if (pr.title.match(/[A-Z].*/)) {
  const comment = `This PR does not have a capitalized title.
  
  Giving PRs a well-formatted title makes it easy for reviewers to get an overview of the changes in the PR and makes it easy to maintain a CHANGELOG.`;
  warn(comment);
  willShowGuidelines = true
}

// PRs should be small.
const bigPRThreshold = 500;
if (github.pr.additions + github.pr.deletions > bigPRThreshold) {
  const comment = `This PR has more than ${bigPRThreshold} changes.
  
  Keeping PRs small makes it easier for reviewers to give faster in-depth quality reviews and makes it easier to catch potential bugs.`;
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
    const secondComment = `This PR has assigned reviewers, but does not add tests.
    
    Testing PR changes before requesting a review leads to faster in-depth quality reviews and makes it easier to catch potential bugs.`;
    message(secondComment);
  }
}

if (commits.some((i) => i.commit.message.length < 3)) {
  const comment = `This PR has commits with short messages.
  
  Ensuring PRs have descriptive commit messages allow reviewers to get an overview of the changes and leads to faster reviews.`;
  message(comment);
  willShowGuidelines = true
}

const teamReviewersThreshold = 2;
if (github.requested_reviewers.teams.length > teamReviewersThreshold) {
  const comment = `This PR has more than ${teamReviewersThreshold} teams assigned.
  
  Assigning more than 2 teams to PRs leads to confusion around who is responsible for reviewing the PR and longer review times.`;
  warn(comment);
  willShowGuidelines = true
}

const userReviewersThreshold = 3;
if (github.requested_reviewers.users.length > userReviewersThreshold) {
  const comment = `This PR has more than ${userReviewersThreshold} individual reviewers assigned.
  
  Assigning more than 2 reviewers to PRs leads to confusion around who is responsible for reviewing the PR and longer review times.`;
  warn(comment);
  willShowGuidelines = true
}

if (github.requested_reviewers.users.length === 0) {
  const comment = `This PR has no assigned reviewers.
  
  Team members and CODEOWNERS can be assigned to get knowledgeable feedback on changes.`;
  message(comment);
  willShowGuidelines = true
}

const loginOrEmpty = () => {
  const login = pr?.user?.login;
  return login ? ` @${login}` : "";
};

markdown(`Good work${loginOrEmpty()}! ❤️`);

if (willShowGuidelines) {
  markdown(`If you are in doubt why this appears, [check out our PR guidelines](https://www.notion.so/pleo/PR-and-Code-Review-Culture-at-Pleo-220324344eb849f3b636cd00a28b4a41)! 📚`);
}
