# Description
Describes how to implement a VTL template that performs an UpdateItem operation to AWS DynamoDB.

You only need to modify a few predefined parts to implement the query operation.

For further details, see [DynamoDB UpdateItem](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html).

# Provide
- Generating partition key-only UpdateItem operations
- Generating UpdateItem operation including sort key
- Generating attribute specifications to be updated

# Usage

## Basic
By modifying the "User Input" section at the top of the VTL template code described below, queries can be generated for each use case.

Modifications to code other than the "User Input" and “Update parameter settings” can be made at the discretion of the developer, but are not supported in this document.

## Partition key only queries
Enter only information about the primary key. The following is an example configuration.
```velocity
## [Start] User Input
#set( $primaryValue = $ctx.args.Id )
#set( $primaryKey = "Id" )
#set( $args = $ctx.args )
## [End] User Input
```

## With sort key
In addition to the primary key, enter information about the sort key. The following is an example configuration.
```velocity
## [Start] User Input
#set( $primaryValue = $ctx.args.Id )
#set( $primaryKey = "Id" )
#set( $itemId = $ctx.args.ActivityId )
#set( $sortKeyValue = "Activity#$itemId" )
#set( $sortKeyName = "Sk" )
#set( $args = $ctx.args )
## [End] User Input
```

## Specify attributes
Enter the field name and value to be updated. The following is an example configuration.
```velocity
## [Start] Update parameter settings (to be created repeatedly)
#if( $util.isString($args.DisplayUserName) )
  $util.qr($expressionNames.put("#DisplayUserName", "DisplayUserName"))
  $util.qr($expressionValues.put(":DisplayUserName", $util.dynamodb.toDynamoDB($args.DisplayUserName) ))
  #if( $expression != 'SET' )
    #set( $expression = "$expression," )
  #end
  #set( $expression = "$expression #DisplayUserName = :DisplayUserName" )
#end
## [End] Update parameter settings (to be created repeatedly)
```

# Request template
```velocity
#set( $args = $util.defaultIfNull($ctx.args.input, {}) )

## [START] User Input
#set( $primaryKeyValue = "your primary key value" )
#set( $primaryKeyName = "your primary key attribute name" )
#set( $sortKeyValue = "your sort key value" )
#set( $sortKeyName = "your sort key attribute name" )
## [END] User Input

## [START] variable setting
#set( $expression = 'SET' )
#set( $expressionNames = {} )
#set( $expressionValues = {} )
## [END] variable setting

## [START] Items set automatically
#set( $nowDate = $util.time.nowISO8601() )
$util.qr( $expressionNames.put("#UpdatedAt", "UpdatedAt") )
$util.qr( $expressionValues.put(":UpdatedAt", $util.dynamodb.toDynamoDB($nowDate) ))
#set( $expression = "$expression #UpdatedAt = :UpdatedAt" )
## [END] Items set automatically

## [START] Update parameter settings (to be created repeatedly)
#if( $util.isString($args.YourAttributeValue) )
  $util.qr($expressionNames.put("#YourAttributeName", "YourAttributeName"))
  $util.qr($expressionValues.put(":YourAttributeName", $util.dynamodb.toDynamoDB($args.YourAttributeValue) ))
  #if( $expression != 'SET' )
    #set( $expression = "$expression," )
  #end
  #set( $expression = "$expression #YourAttributeName = :YourAttributeName" )
#end
## [END] Update parameter settings (to be created repeatedly)

## [START] validation
#if( $expression == 'SET' )
  $util.error('Update parameters are not set.')
#end

#set( $key = {} )
$util.qr($key.put($primaryKeyName, $util.dynamodb.toDynamoDB($primaryKeyValue)))
#if( !$util.isNullOrEmpty($sortKeyName) && !$util.isNullOrEmpty($sortKeyValue) )
  $util.qr($key.put($sortKeyName, $util.dynamodb.toDynamoDB($sortKeyValue)))
#end
## [END] validation

#set( $updateItem = {
    "version" : "2018-05-29",
    "operation" : "UpdateItem",
    "key" : $key,
    "update": {
        "expression" : $expression,
        "expressionNames": $expressionNames,
        "expressionValues" : $expressionValues
    }
} )

$util.toJson($updateItem)
```
# Response template
```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#else
  $util.toJson($ctx.result)
#end
```
