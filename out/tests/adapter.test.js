/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var vscode_debugadapter_testsupport_1 = require("vscode-debugadapter-testsupport");
suite('Node Debug Adapter', function () {
    var PROJECT_ROOT = Path.join(__dirname, '../../');
    var DATA_ROOT = Path.join(PROJECT_ROOT, 'testdata/');
    var DEBUG_ADAPTER = Path.join(PROJECT_ROOT, 'bin/Release/mono-debug.exe');
    var dc;
    setup(function () {
        dc = new vscode_debugadapter_testsupport_1.DebugClient('mono', DEBUG_ADAPTER, 'mono');
        return dc.start();
    });
    teardown(function () { return dc.stop(); });
    suite('basic', function () {
        test('unknown request should produce error', function (done) {
            dc.send('illegal_request').then(function () {
                done(new Error("does not report error on unknown request"));
            }).catch(function () {
                done();
            });
        });
    });
    suite('initialize', function () {
        test('should produce error for invalid \'pathFormat\'', function (done) {
            dc.initializeRequest({
                adapterID: 'mono',
                linesStartAt1: true,
                columnsStartAt1: true,
                pathFormat: 'url'
            }).then(function (response) {
                done(new Error("does not report error on invalid 'pathFormat' attribute"));
            }).catch(function (err) {
                // error expected
                done();
            });
        });
    });
    suite('launch', function () {
        test('should run program to the end', function () {
            var PROGRAM = Path.join(DATA_ROOT, 'simple/Program.exe');
            return Promise.all([
                dc.configurationSequence(),
                dc.launch({ program: PROGRAM }),
                dc.waitForEvent('terminated')
            ]);
        });
        test('should run program to the end (and not stop on Debugger.Break())', function () {
            var PROGRAM = Path.join(DATA_ROOT, 'simple_break/Program.exe');
            return Promise.all([
                dc.configurationSequence(),
                dc.launch({ program: PROGRAM, noDebug: true }),
                dc.waitForEvent('terminated')
            ]);
        });
        /*
        test('should stop on debugger statement', () => {

            const PROGRAM = Path.join(DATA_ROOT, 'simple_break/Program.exe');
            var DEBUGGER_LINE = 10;

            /* assertStoppedLocation(reason: string, expected: {
                path?: string | RegExp;
                line?: number;
                column?: number;
            * /

            return Promise.all([
                dc.configurationSequence(),
                dc.launch({ program: PROGRAM }),
                dc.assertStoppedLocation('step', DEBUGGER_LINE)
            ]);
        });
        */
    });
    suite('setBreakpoints', function () {
        var PROGRAM = Path.join(DATA_ROOT, 'simple/Program.exe');
        var SOURCE = Path.join(DATA_ROOT, 'simple/Program.cs');
        var BREAKPOINT_LINE = 13;
        test('should stop on a breakpoint', function () {
            return dc.hitBreakpoint({ program: PROGRAM }, { path: SOURCE, line: BREAKPOINT_LINE });
        });
    });
    suite('output events', function () {
        var PROGRAM = Path.join(DATA_ROOT, 'output/Output.exe');
        test('stdout and stderr events should be complete and in correct order', function () {
            return Promise.all([
                dc.configurationSequence(),
                dc.launch({ program: PROGRAM }),
                dc.assertOutput('stdout', "Hello stdout 0\nHello stdout 1\nHello stdout 2\n"),
                dc.assertOutput('stderr', "Hello stderr 0\nHello stderr 1\nHello stderr 2\n")
            ]);
        });
    });
    suite('FSharp Tests', function () {
        var PROGRAM = Path.join(DATA_ROOT, 'fsharp/Program.exe');
        var SOURCE = Path.join(DATA_ROOT, 'fsharp/Program.fs');
        var BREAKPOINT_LINE = 8;
        test('should stop on a breakpoint in an fsharp program', function () {
            return dc.hitBreakpoint({ program: PROGRAM }, { path: SOURCE, line: BREAKPOINT_LINE });
        });
    });
});
//# sourceMappingURL=adapter.test.js.map