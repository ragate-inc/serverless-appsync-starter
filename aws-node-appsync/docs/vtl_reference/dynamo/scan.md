# Description
This section describes how to implement a VTL template to execute a scan operation to AWS DynamoDB.

You only need to modify a few predefined parts to implement the query operation.

# Provide
# Usage
# Request template
```velocity
#set( $args = $ctx.args )

## [Start] VTL string output
#set( $limit = $util.defaultIfNull($args.limit, 100) )
#set( $request = {
  "version": "2018-05-29",
  "limit": $limit
} )
#if( $args.nextToken && !$util.isNullOrEmpty($args.nextToken) )
  #set( $request.nextToken = $args.nextToken )
#end
#if( $args.filter )
  #set( $request.filter = $util.parseJson("$util.transform.toDynamoDBFilterExpression($args.filter)") )
#end
$util.qr($request.put("operation", "Scan"))
$util.toJson($request)
## [End] VTL string output
```

# Response template
```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#else
  $util.toJson($ctx.result)
#end
```
