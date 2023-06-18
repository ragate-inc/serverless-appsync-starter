# Description
This section describes how to implement a VTL template to execute a query operation to AWS DynamoDB.
You only need to modify a few predefined parts to implement the query operation.

# Provide
- Generating queries using only partition keys
- Generating Queries Using Sort Keys
- Generating queries using GSI

# Usage

## basic
By modifying the "共通設定" section at the top of the VTL template code described below, queries can be generated for each use case.
Modifications to code other than the "共通設定" can be made at the discretion of the developer, but are not supported in this document.

## Partition key only queries
Enter only information about the primary key. The following is an example configuration.
```velocity
## [Start] 共通設定
#set( $primaryKey = "Id" )
#set( $primaryValue = $ctx.source.Id )
#set( $args = $ctx.args )
## [End] 共通設定
```

## Query with sort key
In addition to the primary key, enter information about the sort key. The following is an example configuration.
```velocity
## [Start] 共通設定
#set( $primaryKey = "Id" )
#set( $primaryValue = $ctx.args.Id )
#set( $sortKeyName = "Sk" )
#set( $sortKeyValue = {
  "beginsWith": "Activity#",
} )
#set( $args = $ctx.args )
## [End] 共通設定
```

## Query using GSI
In addition to the primary key and sort key, enter the GSI index name. The following is an example configuration.
```velocity
## [Start] 共通設定
#set( $indexName = "PaymentHistoryByIdPaymentAt" )
#set( $primaryKey = "Id" )
#set( $primaryValue = $ctx.args.Id )
#set( $args = $ctx.args )
## [End] 共通設定
```

# Request template
```velocity
## [Start] 共通設定
#set( $indexName = "your gsi index name" )
#set( $primaryKey = "your primary key attribute name" )
#set( $primaryValue = "your primary key value" )
#set( $sortKeyName = "your sort key attribute name" )
#set( $sortKeyValue = "your sort key value" )
#set( $args = $ctx.args )
## [End] 共通設定

## [Start] バリデーション
#set( $modelQueryExpression = {} )
#if( $util.isNullOrEmpty($primaryValue) )
  $util.error("PrimaryValue is null.", "InvalidIndexValueError")
#else
  #set( $modelQueryExpression.expression = "#$primaryKey = :$primaryKey" )
  #set( $modelQueryExpression.expressionNames = {
    "#$primaryKey": $primaryKey
  })
  #set( $modelQueryExpression.expressionValues = {
    ":$primaryKey": $util.dynamodb.toDynamoDB($primaryValue)
  })
#end
## [End] バリデーション

## [Start] ソートキー用クエリー生成
#if( !$util.isNullOrEmpty($sortKeyName) && !$util.isNullOrEmpty($sortKeyValue) )
  #if( !$util.isNull($sortKeyValue.beginsWith) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND begins_with(#sortKey, :sortKey)" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey",  $util.dynamodb.toDynamoDB("$sortKeyValue.beginsWith") ))
  #elseif( !$util.isNull($sortKeyValue.between) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND #sortKey BETWEEN :sortKey0 AND :sortKey1" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey0", $util.dynamodb.toDynamoDB("$sortKeyValue.between[0]") ))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey1", $util.dynamodb.toDynamoDB("$sortKeyValue.between[1]") ))
  #elseif( !$util.isNull($sortKeyValue.eq) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND #sortKey = :sortKey" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey", $util.dynamodb.toDynamoDB("$sortKeyValue.eq") ))
  #elseif( !$util.isNull($sortKeyValue.lt) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND #sortKey < :sortKey" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey", $util.dynamodb.toDynamoDB("$sortKeyValue.lt") ))
  #elseif( !$util.isNull($sortKeyValue.le) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND #sortKey <= :sortKey" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey", $util.dynamodb.toDynamoDB("$sortKeyValue.le") ))
  #elseif( !$util.isNull($sortKeyValue.gt) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND #sortKey > :sortKey" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey", $util.dynamodb.toDynamoDB("$sortKeyValue.gt") ))
  #elseif( !$util.isNull($sortKeyValue.ge) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND #sortKey >= :sortKey" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey", $util.dynamodb.toDynamoDB("$sortKeyValue.ge") ))
  #elseif( !$util.isNull($sortKeyValue.contains) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND contains(#sortKey, :sortKey)" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey", $util.dynamodb.toDynamoDB("$sortKeyValue.contains") ))
  #elseif( !$util.isNull($sortKeyValue.notContains) )
    #set( $modelQueryExpression.expression = "$modelQueryExpression.expression AND notContains(#sortKey, :sortKey)" )
    $util.qr($modelQueryExpression.expressionNames.put("#sortKey", "$sortKeyName"))
    $util.qr($modelQueryExpression.expressionValues.put(":sortKey", $util.dynamodb.toDynamoDB("$sortKeyValue.notContains") ))
  #else
  #end
#end
## [End] ソートキー用クエリー生成

## [Start] VTL文字列出力
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
#if( !$util.isNull($modelQueryExpression) && !$util.isNullOrEmpty($modelQueryExpression.expression) )
  $util.qr($request.put("operation", "Query"))
  $util.qr($request.put("query", $modelQueryExpression))
  #if( $util.isNullOrEmpty($args.sortDirection) )
    #set( $request.scanIndexForward = false )
  #elseif( $args.sortDirection == "ASC" )
    #set( $request.scanIndexForward = true )
  #elseif( $args.sortDirection == "DESC" )
    #set( $request.scanIndexForward = false )
  #end
#else
  $util.qr($request.put("operation", "Scan"))
#end
#if(!$util.isNull($indexName))
    $util.qr($request.put("index", $indexName))
#end
$util.toJson($request)
## [End] VTL文字列出力
```

# Response template
```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#else
  $util.toJson($ctx.result)
#end
```
