# Description
Describes how to implement a VTL template that performs an GetItem operation to AWS DynamoDB.

You only need to modify a few predefined parts to implement the query operation.

For further details, see [DynamoDB GetItem](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html).

# Provide
- Generating partition key-only GetItem operations
- Generating GetItem operation including sort key

# Usage
## basic
By modifying the "User Input" section at the top of the VTL template code described below, queries can be generated for each use case.

Modifications to code other than the "User Input" can be made at the discretion of the developer, but are not supported in this document.

## Partition key only queries
Enter only information about the primary key. The following is an example configuration.
```velocity
## [Start] User Input
#set( $primaryKey = "Id" )
#set( $primaryValue = $ctx.source.Id )
#set( $args = $ctx.args )
#set( $consistentRead = false )
## [End] User Input
```

## With sort key
In addition to the primary key, enter information about the sort key. The following is an example configuration.
```velocity
## [Start] User Input
#set( $primaryKey = "Id" )
#set( $primaryValue = $ctx.args.Id )
#set( $itemId = $ctx.args.itemId )
#set( $sortKeyName = "Sk" )
#set( $sortKeyValue = "Activity#$itemId" )
#set( $args = $ctx.args )
#set( $consistentRead = false )
## [End] User Input
```

## With consistent read
When ConsistentRead is also used
```velocity
## [Start] User Input
#set( $primaryKey = "Id" )
#set( $primaryValue = $ctx.args.Id )
#set( $itemId = $ctx.args.itemId )
#set( $sortKeyName = "Sk" )
#set( $sortKeyValue = "Activity#$itemId" )
#set( $args = $ctx.args )
#set( $consistentRead = true ) # here
## [End] User Input
```

# Request template
```velocity
## [Start] User Input
#set( $primaryKey = "your primary key attribute name" )
#set( $primaryValue = "your primary key value" )
#set( $sortKeyName = "your sory key attribute name" )
#set( $sortKeyValue = "your sort key value" )
#set( $consistentRead = false )
## [End] User Input

## [Start] validation
#set( $modelExpression = {
    "version" : "2017-02-28",
    "operation" : "GetItem",
    "key" : {},
    "consistentRead" : $consistentRead
} )
#if( $util.isNullOrEmpty($primaryValue) )
  $util.error("PrimaryValue is null.", "InvalidIndexValueError")
#else
  $util.qr($modelExpression.key.put($primaryKey, $util.dynamodb.toDynamoDB($primaryValue)))
#end
#if( !$util.isNullOrEmpty($sortKeyName) && $util.isNullOrEmpty($sortKeyValue) )
  $util.error("sortKeyValue is null.", "InvalidIndexValueError")
#elseif( !$util.isNullOrEmpty($sortKeyName) && !$util.isNullOrEmpty($sortKeyValue) )
  $util.qr($modelExpression.key.put($sortKeyName, $util.dynamodb.toDynamoDB($sortKeyValue)))
#end
## [End] validation

$util.toJson($modelExpression)
```
# Response template
```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#else
  $util.toJson($ctx.result)
#end
```
