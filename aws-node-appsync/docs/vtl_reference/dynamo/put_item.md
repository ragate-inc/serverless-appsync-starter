# Description
Describes how to implement a VTL template that performs an PutItem operation to AWS DynamoDB.

You only need to modify a few predefined parts to implement the query operation.

For further details, see [DynamoDB PutItem](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html).

# Provide
- Generating partition key-only PutItem operations
- Generating PutItem operation including sort key

# Usage

## basic
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
#set( $expression = "attribute_not_exists($primaryKeyName)" )
$util.qr($key.put($primaryKeyName, $util.dynamodb.toDynamoDB($primaryKeyValue)))
#if( !$util.isNullOrEmpty($sortKeyName) && !$util.isNullOrEmpty($sortKeyValue) )
  $util.qr($key.put($sortKeyName, $util.dynamodb.toDynamoDB($sortKeyValue)))
  #set( $expression = "$expression AND attribute_not_exists($sortKeyName)" )
#end
#set( $condition = { "expression": $expression } )
## [END] validation

## [START] attribute values
#set($attributeValues = {})
#foreach( $entry in $args.entrySet() )
  #if( $entry.key != "input" )
    $util.qr($attributeValues.put($entry.key, $entry.value))
  #end
#end
#foreach( $entry in $attributeValuesWithoutIndexValues.entrySet() )
  $util.qr($attributeValues.put($entry.key, $entry.value))
#end
## [END] attribute values

#set( $PutObject = {
  "version": "2018-05-29",
  "operation": "PutItem",
  "attributeValues": $util.dynamodb.toMapValues($l),
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
