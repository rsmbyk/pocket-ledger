/**
 * Report a successful Cloudflare deploy to GitHub Environments / Deployments.
 *
 * Intended to run after `wrangler deploy` in Workers Builds. Skips quietly when
 * no token is configured (local builds stay optional).
 *
 * Env:
 *   GITHUB_DEPLOYMENTS_TOKEN or GITHUB_TOKEN — PAT with `deployments:write`
 *   WORKERS_CI_COMMIT_SHA / GITHUB_SHA — commit to attach (optional; uses git HEAD)
 *   WORKERS_CI_BRANCH — branch name (optional)
 *   GITHUB_REPOSITORY — owner/repo (default: rsmbyk/pocket-ledger)
 *   PRODUCTION_URL — environment URL (default: live workers.dev URL)
 */
import { execSync } from 'node:child_process';

const token = process.env.GITHUB_DEPLOYMENTS_TOKEN || process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY || 'rsmbyk/pocket-ledger';
const environment = process.env.GITHUB_DEPLOYMENT_ENVIRONMENT || 'production';
const environmentUrl =
	process.env.PRODUCTION_URL || 'https://pocket-ledger.ronaldsumbayak611.workers.dev/';
const description = process.env.GITHUB_DEPLOYMENT_DESCRIPTION || 'Cloudflare Workers';

function resolveSha() {
	return (
		process.env.WORKERS_CI_COMMIT_SHA ||
		process.env.GITHUB_SHA ||
		execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
	);
}

function resolveRef() {
	return process.env.WORKERS_CI_BRANCH || process.env.GITHUB_REF_NAME || resolveSha();
}

async function gh(path, init = {}) {
	const res = await fetch(`https://api.github.com${path}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'Content-Type': 'application/json',
			...(init.headers ?? {})
		}
	});
	const text = await res.text();
	const body = text ? JSON.parse(text) : null;
	if (!res.ok) {
		throw new Error(`GitHub API ${res.status} ${path}: ${text}`);
	}
	return body;
}

async function main() {
	if (!token) {
		console.log('Skipping GitHub deployment report (no GITHUB_DEPLOYMENTS_TOKEN / GITHUB_TOKEN).');
		return;
	}

	const sha = resolveSha();
	const ref = resolveRef();
	console.log(`Reporting GitHub deployment for ${repo}@${sha} → ${environment}`);

	const deployment = await gh(`/repos/${repo}/deployments`, {
		method: 'POST',
		body: JSON.stringify({
			ref: sha,
			environment,
			description,
			auto_merge: false,
			required_contexts: [],
			production_environment: environment === 'production',
			payload: {
				provider: 'cloudflare-workers',
				branch: ref
			}
		})
	});

	await gh(`/repos/${repo}/deployments/${deployment.id}/statuses`, {
		method: 'POST',
		body: JSON.stringify({
			state: 'success',
			environment,
			environment_url: environmentUrl,
			description: 'Live on Cloudflare Workers',
			log_url: process.env.WORKERS_CI_BUILD_UUID
				? `https://dash.cloudflare.com/?to=/:account/workers/services/view/pocket-ledger`
				: 'https://dash.cloudflare.com/'
		})
	});

	console.log(`GitHub deployment #${deployment.id} marked success → ${environmentUrl}`);
}

main().catch((err) => {
	console.error(err);
	// Don't fail the Cloudflare deploy if GitHub reporting flakes.
	process.exitCode = 0;
});
