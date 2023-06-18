# Description
# Provide
# Usage
## basic
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

## [START] Update parameter settings (to be created repeatedly)
#if( $util.isString($args.DisplayUserName) )
  $util.qr($expressionNames.put("#YourAttributeName", "YourAttributeName"))
  $util.qr($expressionValues.put(":YourAttributeName", { "S": "YourAttributeValue" } ))
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
