# Description
Describes how to implement a VTL template that performs an DeleteItem operation to AWS DynamoDB.

You only need to modify a few predefined parts to implement the query operation.

For further details, see [DynamoDB DeleteItem](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html).

# Provide
- Generating partition key-only DeleteItem operations
- Generating DeleteItem operation including sort key

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
## [End] User Input
```

# Request template
```velocity
## [START] User Input
#set( $primaryKeyValue = "your primary key value" )
#set( $primaryKeyName = "your primary key attribute name" )
#set( $sortKeyValue = "your sort key value" )
#set( $sortKeyName = "your sort key attribute name" )
## [END] User Input

## [START] validation
#set( $key = {} )
$util.qr($key.put($primaryKeyName, $util.dynamodb.toDynamoDB($primaryKeyValue)))
#if( !$util.isNullOrEmpty($sortKeyName) && !$util.isNullOrEmpty($sortKeyValue) )
  $util.qr($key.put($sortKeyName, $util.dynamodb.toDynamoDB($sortKeyValue)))
#end
## [END] validation

#set( $deleteItem = {
    "version" : "2018-05-29",
    "operation" : "DeleteItem",
    "key" : $key
})

$util.toJson($deleteItem)
```
# Response template
```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#else
  $util.toJson($ctx.result)
#end
```
