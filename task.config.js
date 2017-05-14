exports.inject = [
  require('task/packages/task-build-js'),
  require('task/packages/task-child-process'),
  require('task/packages/task-livereload')
]

exports.tasks = {
  'build-test': {
    type: 'build-js',
    options: {
      entry: 'test/index.js',
      dest: 'test/dist/index.js',
      raw: true,
      targets: [ 'inline' ]
    },
    done: {
      on (val, stamp, done) {
        done.root().set({ tasks: { reload: { done: true } } }, stamp)
      }
    }
  },
  'serve-app': {
    type: 'child-process',
    options: {
      cmd: 'node test/server.js'
    }
  }
}
