# Description
# Provide
# Usage
## basic
# Request template
```velocity
## [Start] User Input
#set($payload = $ctx.args )
#set($primaryValue = "your primary key value" )
## [End] User Input

#if( $util.isNullOrEmpty($primaryValue) )
  #return
#end

{
    "version": "2017-02-28",
    "payload": $util.toJson($payload)
}
```
# Response template
```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#else
  $util.toJson($ctx.result)
#end
```
