# Description
This section describes how to operate the local resolver.

# Provide
- Generate a local resolver by specifying the primary key from the argument
- Generate a local resolver by specifying the primary key from the relation

# Usage
## basic
Local resolvers can be generated for each use case by modifying the "User Input" section at the top of the VTL template code, described below.
Modifications to code other than the "User Input" can be made at the discretion of the developer, but are not supported in this document.

## Specify partition key from args
Used in APIs such as get
```velocity
## [Start] User Input
#set( $payload = $ctx.args )
#set( $primaryValue = $ctx.args.Id)
## [End] User Input
```

## Specify partition key from source
Used for related and other purposes
```velocity
## [Start] User Input
#set( $payload = $ctx.source )
#set( $primaryValue = $ctx.source.Id)
## [End] User Input
```

# Request template
```velocity
## [Start] User Input
#set( $payload = $ctx.args )
#set( $primaryValue = "your primary key value" )
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
