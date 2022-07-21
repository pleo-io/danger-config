import { danger, fail, markdown, message, warn } from "danger";

// Setup
const github = danger.github;
const pr = github.pr;
const commits = github.commits;
const modified = danger.git.modified_files;
const created = danger.git.created_files;

(async () => {
  const isBot = pr.user.login?.includes("pleo-bot");

  if (isBot) {
    return;
  }

  const isDraft = (
    await github.api.pulls.get({
      owner: github.thisPR?.owner,
      repo: github.thisPR?.repo,
      pull_number: github.thisPR?.number,
    })
  )?.data?.draft;

  let willShowGuidelines = false;

  // No PR is too small to warrant a paragraph or two of summary.
  if (!isDraft && pr.body.length === 0) {
    const comment = `This PR does not include a description.`;
    fail(comment);
    willShowGuidelines = true;
  }

  // PRs have a proper title.
  if (!isDraft && pr.title.length < 4) {
    const comment = `This PR does not have descriptive title.`;
    warn(comment);
    willShowGuidelines = true;
  }

  // PRs should be small.
  const bigPRThreshold = 600;
  if (github.pr.additions + github.pr.deletions > bigPRThreshold) {
    const comment = `This PR has more than ${bigPRThreshold} changes.`;
    warn(comment);
    willShowGuidelines = true;
  }

  //PRs should include tests for changes.
  const hasCreatedKotlin = created.some((path) => path.endsWith(".kt"));
  const hasCreatedTests = created.some((f) => f.match(/test/));

  const hasModifiedKotlin = modified.some((path) => path.endsWith(".kt"));
  const hasModifiedTests = modified.some((f) => f.match(/test/));

  if (hasModifiedKotlin && hasModifiedTests !== true || hasCreatedKotlin && hasCreatedTests) {
    const comment = `This PR does not add or modify tests.`;
    warn(comment);
    willShowGuidelines = true;
  }

  if (!isDraft && commits.some((i) => i.commit.message.length < 3)) {
    const comment = `This PR has commits with short or non-descriptive messages.`;
    message(comment);
    willShowGuidelines = true;
  }

  const teamReviewersThreshold = 2;
  if (github.requested_reviewers.teams.length > teamReviewersThreshold) {
    const comment = `This PR has more than ${teamReviewersThreshold} teams assigned.`;
    warn(comment);
    willShowGuidelines = true;
  }

  const userReviewersThreshold = 3;
  if (github.requested_reviewers.users.length > userReviewersThreshold) {
    const comment = `This PR has more than ${userReviewersThreshold} individual reviewers assigned.`;
    warn(comment);
    willShowGuidelines = true;
  }

  if (willShowGuidelines) {
    const message = `❤️ Good work! 📚 If you are in wondering why these messages appear, [check out our PR guidelines](https://www.notion.so/pleo/PR-and-Code-Review-Culture-at-Pleo-220324344eb849f3b636cd00a28b4a41)! 

📄 _PR checks are defined in [our Dangerfile](https://github.com/pleo-io/danger-config/blob/master/dangerfile.ts). 📢 Reach out to [#engprod-devexp](https://getpleo.slack.com/archives/C030H8BMU8K) for questions._

`;
    markdown(message);
  }
})();
