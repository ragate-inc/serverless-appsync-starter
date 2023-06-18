# Description
# Provide
# Usage
## basic
# Request template
```velocity
## [START] User Input
#set( $primaryKeyValue = "your primary key value" )
#set( $primaryKeyName = "your primary key attribute name" )
#set( $sortKeyValue = "your sort key value" )
#set( $sortKeyName = "your sort key attribute name" )
## [END] User Input

## [START] attribute values other than index system
#set( $args = $util.defaultIfNull($ctx.args.input, {}) )
#set( $nowDateTime = $util.time.nowISO8601() )

#set( $attributeValuesWithoutIndexValues = {
  "UpdatedAt": $nowDateTime,
  "CreatedAt": $nowDateTime
} )
## [END] attribute values other than index system

## [START] validation
#if( $util.isNullOrEmpty($primaryKeyName) )
  $util.error("primaryKeyName is null or empty.", "InvalidIndexValueError")
#elseif( $util.isNullOrEmpty($primaryKeyValue) )
  $util.error("primaryKeyValue is null or empty.", "InvalidIndexValueError")
#end
#if( !$util.isNullOrEmpty($sortKeyName) && $util.isNullOrEmpty($sortKeyValue) )
  $util.error("sortKeyValue is null or empty.", "InvalidIndexValueError")
#elseif( $util.isNullOrEmpty($sortKeyName) && !$util.isNullOrEmpty($sortKeyValue) )
  $util.error("sortKeyName is null or empty.", "InvalidIndexValueError")
#end
#set( $key = {} )
#set( $condition = "attribute_not_exists($primaryKeyName)" )
$util.qr($key.put($primaryKeyName, $util.dynamodb.toDynamoDB($primaryKeyValue)))
#if( !$util.isNullOrEmpty($sortKeyName) && !$util.isNullOrEmpty($sortKeyValue) )
  $util.qr($key.put($sortKeyName, $util.dynamodb.toDynamoDB($sortKeyValue)))
  #set( $condition = "$condition AND attribute_not_exists($sortKeyName)" )
#end
## [END] validation

#set( $PutObject = {
  "version": "2018-05-29",
  "operation": "PutItem",
  "attributeValues":   $util.dynamodb.toMapValues($attributeValuesWithoutIndexValues),
  "key": $key,
  "condition" : $condition
} )

$util.toJson($PutObject)
```
# Response template
```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#else
  $util.toJson($ctx.result)
#end
```
