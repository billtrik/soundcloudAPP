fs     = require 'fs'
{exec} = require 'child_process'


appFiles  = [
  'main'
  'hogan'
  'storage'
  'playlist'
  'website'
]

task 'build', 'Build single and concatenated files and their minified versions', ->
  console.log '** Initiating single files task **'
  build_single_files()

build_single_files = (callback) ->
  exec 'coffee --bare --compile --output js/ coffee/', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr if stdout isnt "" or stderr isnt ""
    console.log 'Compilation of single files complete.'
    remaining = appFiles.length
    for file, index in appFiles then do (file, index) ->
      exec "uglifyjs -o js/#{file}.min.js js/#{file}.js", (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr if stdout isnt "" or stderr isnt ""
      console.log('** Minification of single files complete **') if --remaining is 0