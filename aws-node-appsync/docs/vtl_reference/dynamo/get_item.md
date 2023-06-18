# Description
# Provide
# Usage
## basic
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
```
