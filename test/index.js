const gutil = require('gulp-util');
const es = require('event-stream');
const tinylr = require('tiny-lr');
const glr = require('../index.js');
const sinon = require('sinon');
const assert = require('assert');

const cwd = process.cwd();
const file = new gutil.File({ base: cwd, cwd: cwd, path: cwd + '/style.css' });
const keys = ['basePath', 'key', 'cert', 'start', 'quiet', 'reloadPage'];
let srv, log;

describe('gulp-livereload', () => {
  beforeEach(() => {
    srv = sinon.stub(tinylr, 'Server');
    log = sinon.stub(gutil, 'log');
  });
  afterEach(() => {
    keys.forEach((key) => {
      delete glr.options[key];
    });
    glr.server = null;
    srv.restore();
    log.restore();
  });
  it('does not work', (done) => {
    let spy = sinon.spy();
    srv.returns({ changed: spy , listen: () => {}});
    es.readable(function(count, next) {
      this.emit('data', file);
      this.emit('end');
      next();
    })
      .pipe(glr({ basePath: cwd }))
      .on('end', () => {
        assert(spy.notCalled);
        done();
      });
  });
  it('works', (done) => {
    let spy = sinon.spy();
    srv.returns({ changed: spy , listen: () => {}});
    let lr = glr();
    glr.listen();
    es.readable(function(count, next) {
      this.emit('data', file);
      this.emit('end');
      next();
    })
      .pipe(lr)
      .on('end', () => {
        assert(spy.calledWith(files(file.path)));
        done();
      });
  });
  it('listen callback', () => {
    let spy = sinon.spy();
    srv.returns({ listen: (port, host, cb) => {
      cb();
    }});
    glr.listen(spy);
    assert(spy.called);
  });
  it('middleware', () => {
    assert(typeof glr.middleware === 'function');
  });
  it('non-standard port', () => {
    let spy = sinon.spy();
    srv.returns({ listen: spy });

    glr.server = null;
    glr.listen(2453);
    assert(spy.firstCall.calledWith(2453));

    glr.server = null;
    glr.listen({ port: 9754 });
    assert(spy.secondCall.calledWith(9754));
  });
  it('https', () => {
    let https = require('https');
    let spy = sinon.spy(https, 'createServer');
    let read = require('fs').readFileSync;
    let opts  = {
      key: read(__dirname + '/dev.key'),
      cert: read(__dirname + '/dev.pem')
    };
    srv.restore();
    glr.listen(opts);
    assert(spy.called);
    glr.server.close();
  });
  it('vinyl', () => {
    let spy = sinon.spy();
    srv.returns({ changed: spy, listen: () => {} });
    glr.listen();
    glr.changed(file);
    assert(spy.calledWith(files(file.path)));
  });
  it('reload', () => {
    let spy = sinon.spy();
    srv.returns({ changed: spy, listen: () => {} });
    glr.listen();

    glr.reload();
    assert(spy.firstCall.calledWith(files(glr.options.reloadPage)));

    glr.reload('not-index.html');
    assert(spy.secondCall.calledWith(files('not-index.html')));
  });
  it('option: basePath', (done) => {
    let spy = sinon.spy();
    srv.returns({ changed: spy , listen: () => {}});
    glr.listen();
    es.readable(function(count, next) {
      this.emit('data', file);
      this.emit('end');
      next();
    })
      .pipe(glr({ basePath: process.cwd() }))
      .on('end', () => {
        assert(spy.calledWith(files('/style.css')));
        done();
      });
  });
  it('option: start', (done) => {
    let spy = sinon.spy();
    srv.returns({ changed: spy , listen: () => {}});
    es.readable(function(count, next) {
      this.emit('data', file);
      this.emit('end');
      next();
    })
      .pipe(glr({ start: true }))
      .on('end', () => {
        assert(spy.calledWith(files(file.path)));
        done();
      });
  });
  it('option: quiet', () => {
    let spy = sinon.spy();
    let logSpy = sinon.spy();
    log.returns(logSpy);
    srv.returns({ changed: spy, listen: () => {} });
    glr.listen({ quiet: true });
    glr.changed(file);
    assert(spy.calledWith(files(file.path)));
    assert(logSpy.notCalled);
  });
  it('option: reloadPage', () => {
    let spy = sinon.spy();
    srv.returns({ changed: spy, listen: () => {} });
    glr.listen({ reloadPage: 'not-index.html' });
    glr.reload();
    assert(spy.calledWith(files('not-index.html')));
  });
});

function files(filePath) {
  return { body: { files: [ filePath ] } };
}
