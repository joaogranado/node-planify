'use strict';

const original = {
    stdout: null,
    stderr: null,
};

/* istanbul ignore next */
function hook(fn) {
    hookStdout(fn);
    hookStderr(fn);
}

function hookStdout(fn) {
    /* istanbul ignore if */
    if (original.stdout) {
        throw new Error('Already hooked');
    }

    original.stdout = process.stdout.write;
    process.stdout.write = fn;
}

function hookStderr(fn) {
    /* istanbul ignore if */
    if (original.stderr) {
        throw new Error('Already hooked');
    }

    original.stderr = process.stderr.write;
    process.stderr.write = fn;
}


function unhook() {
    unhookStdout();
    unhookStderr();
}

function unhookStdout() {
    if (!original.stdout) {
        return;
    }

    process.stdout.write = original.stdout;
    original.stdout = null;
}

function unhookStderr() {
    if (!original.stderr) {
        return;
    }

    process.stderr.write = original.stderr;
    original.stderr = null;
}

// Unhook on uncaught exception to allow to print stuff to stdout/stderr
let uncaughtExceptionCountAfterOurs = 0;

process.on('uncaughtException', (err) => {
    unhook();

    /* istanbul ignore if */
    if (uncaughtExceptionCountAfterOurs === 0) {
        throw err;
    }
});

process.on('newListener', (event) => {
    if (event === 'uncaughtException') {
        uncaughtExceptionCountAfterOurs += 1;
    }
});

module.exports = {
    hook,
    unhook,

    stdout: {
        hook: hookStdout,
        unhook: unhookStdout,
    },

    stderr: {
        hook: hookStderr,
        unhook: unhookStderr,
    },
};
