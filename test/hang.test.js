
import { describe, it } from 'node:test';
import { spawn } from 'node:child_process';
import assert from 'node:assert';
import path from 'node:path';

describe('V2 Hang Regression', () => {
	it('Next component should exit cleanly (natural exit test)', (t, done) => {
		const script = path.resolve('play/repro_hang.js');
		const p = spawn('node', [script], {
			stdio: 'pipe',
			env: { ...process.env, PLAY_DEMO_SEQUENCE: 'x' }
		});

		let output = '';

		p.stdout.on('data', (d) => {
			const str = d.toString();
			output += str;
		});

		p.on('exit', (code) => {
			clearTimeout(tm);
			assert.strictEqual(code, 0, 'Exit code should be 0 (natural exit)');
			assert.ok(output.includes('--- END ---'), 'Should complete execution');
			done();
		});

		// Fail safety
		const tm = setTimeout(() => {
			p.kill();
			done(new Error('Process hung (timeout 2000ms)'));
		}, 2000);
	});
});
