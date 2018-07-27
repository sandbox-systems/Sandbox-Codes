<?php
    try {
        $username = (string)$_GET["username"];
        $code = (string)$_GET["code"];

        $mng = new MongoDB\Driver\Manager("mongodb://sandbox:NhJLmHZb$@localhost:27017/admin");

                $write = new MongoDB\Driver\BulkWrite;
                $write->update(
                    ["username" => $username, "ecode" => new MongoDB\BSON\Binary($code, MongoDB\BSON\Binary::TYPE_GENERIC)],
                    ['$set' => ["everify" => true]],
                    ['multi' => false, 'upsert' => false]
                );
                $result = $mng->executeBulkWrite('sandbox.users', $write);

                if(!$result->getModifiedCount()){
                    throw new Exception("No account exists with that info.");
                }

        header("Location: https://sandboxcodes.com/Login.html");

    }catch(Exception $e){
        die($e->getMessage());
    }
?>