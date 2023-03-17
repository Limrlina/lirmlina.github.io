<?php
require_once 'vendor/autoload.php'; // Включаем библиотеку PHPOffice

use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $formData = $_POST;
    $filesData = $_FILES;
    $requiredFields = array('name', 'city', 'date', 'address', 'furniture_colour', 'furniture_item', 'quantity', 'uploaded_file');
    $missingFields = array();

    foreach ($requiredFields as $field) {
        if ($field == 'uploaded_file') {
            if (!isset($filesData['uploaded_file'])) {
                $missingFields[] = $field;
            }
            continue;
        }
        if (!isset($formData[$field])) {
            $missingFields[] = $field;
        }
    }
    if (!empty($missingFields)) {
        // Если какое-либо из полей формы или загруженного файла не установлено, выведем сообщение об ошибке
        die('The following form fields are not set: ' . implode(', ', $missingFields));
        return;
    }

    // Получаем данные формы
    $city = $formData['city'];
    $date = $formData['date'];
    $address = $formData['address'];
    $uploadedFile = $filesData['uploaded_file'];
    $imagePath = 'code.jpg';
    $furniture_colour = $formData['furniture_colour'];
    $furniture_items = $formData['furniture_item'];
    $quantity = array_reduce($formData['quantity'], function($result, $number) {
        if ($number > 0) {
            $result[] = $number;
        }
        return $result;
    }, array());

    // Проверяем, существует ли загруженный файл
    if (!file_exists($uploadedFile['tmp_name'])) {
    die('Uploaded file not found');
    }

    // Читаем загруженный файл
    $fileContents = file_get_contents($uploadedFile['tmp_name']);

    // Создаем новый word документ
    $phpWord = new PhpWord();
    $section = $phpWord->addSection();

    // Добавляем изображение в документ
    $section->addImage(
        $imagePath,
        array(
        'width' => 100,
        'height' => 50,
        'align' => 'right'
        )
    );

    // Добавляем заголовок в документ
    $docNumber = rand(1000, 9999);
    $section->addText('Накладная №' . $docNumber, array('bold' => true, 'size' => 14), array('align' => 'center'));

    // Добавляем текст в документ
    $section->addText('Адрес получения заказа: г.' . $city . ', ' . $address);
    $section->addText('Дата получения заказа: ' . $date);

    // Устанавливаем стиль для таблицы
    $borderStyle = array('borderSize' => 1, 'borderColor' => '000000', 'valign' => 'center');
    $centerVertically = array('spaceAfter' => 100,'spaceBefore' => 100);
    $centerHorizontally = array('align' => 'center');
    $alignRight = array('align' => 'right');

    // Добавляем таблицу в документ
    $table = $section->addTable($borderStyle);
    $table->addRow();
    $table->addCell(300)->addText('№', null, array_merge($centerVertically ,$centerHorizontally));
    $table->addCell(3000)->addText('Наименование товара', null, array_merge($centerVertically, $centerHorizontally));
    $table->addCell(1500)->addText('Цена', null, array_merge($centerVertically, $centerHorizontally));
    $table->addCell(1500)->addText('Количество', null, array_merge($centerVertically, $centerHorizontally));
    $table->addCell(1500)->addText('Сумма', null, array_merge($centerVertically, $centerHorizontally));

    // Считаем общую сумму заказа
    $totalSum = 0;
    $price_lines = explode("\n", $fileContents);

    // Итерируемся по каждому товару из формы и добавляем его в таблицу
    for ($i = 0; $i < count($furniture_items); $i++) {
        // Берем цену товара из файла с ценами
        foreach ($price_lines as $line) {
            $lineArr = explode(' ', $line);
            if ($lineArr[0] == $furniture_items[$i]) {
                $price = $lineArr[1];
                break;
            }
        }
        
        $quantityNum = $quantity[$i];

        // Считаем сумму товара
        $sum = $quantityNum * $price;
        $totalSum += $sum;

        // Добавляем строку в таблицу
        $table->addRow();
        $table->addCell(300)->addText($i + 1, null, array_merge($centerVertically, $centerHorizontally));
        $table->addCell(3000)->addText($furniture_items[$i] . ', ' . $furniture_colour, null, $centerVertically);
        $table->addCell(1500)->addText($price, null, array_merge($centerVertically, $centerHorizontally));
        $table->addCell(1500)->addText($quantityNum, null, array_merge($centerVertically, $centerHorizontally));
        $table->addCell(1500)->addText($sum, null, array_merge($centerVertically, $centerHorizontally));
    }
    $colorPriceContent = file_get_contents('colorPrice.txt');
    $colorPriceLines = explode("\n", $colorPriceContent);
    foreach ($colorPriceLines as $line) {
        $lineArr = explode(" - ", $line);
        $colorPrice = $line;
        if ($lineArr[0] == $furniture_colour) {
            $colorPrice = $lineArr[1];
            break;
        }
    }
    // Добавляем строку с наценкой за цвет
    $table->addRow();
    $table->addCell(300)->addText('', null, array_merge($centerHorizontally, $centerVertically));
    $table->addCell(3000)->addText('Наценка за цвет', null, array_merge($centerVertically));
    $table->addCell(3000, array('gridSpan' => 2))->addText($colorPrice, null,array_merge($centerHorizontally, $centerVertically));
    $table->addCell(1500)->addText($totalSum, null, array_merge($centerHorizontally, $centerVertically));
    // Добавляем строку с итоговой суммой
    $bold = array('bold' => true);
    $table->addRow();
    $table->addCell(4800, array('gridSpan' => 4))->addText('Итого:', $bold, array_merge($centerVertically, $alignRight));
    $totalSum = $totalSum * $colorPrice;
    $table->addCell(1500)->addText($totalSum, $bold, array_merge($centerVertically, $centerHorizontally));

    $section->addText('');
    $section->addText('Всего наименований ' . count($furniture_items) . ', на сумму ' . number_format($totalSum, 2, ',', ' ') . ' руб.');

    // Загружаем файл с гарантийным обслуживанием и добавляем его в документ
    $requirementsFileContent = file_get_contents('Гарантийное обслуживание.txt');
    // Разбиваем файл на строки по переносу строки
    $requirementsLines = explode("\n", $requirementsFileContent);

    // Итерируемся по каждой строке и добавляем ее в документ
    foreach ($requirementsLines as $line) {
    // Проверяем, начинается ли строка с цифры
    if (preg_match('/^\d+/', $line)) {
        // Если да, добавляем ее как элемент списка
        $section->addText($line, array('listType' => 'number'));
    } else {
        // Если нет, добавляем как обычный текст
        $section->addText($line);
    }
    }

    // Сохраняем документ в файл
    $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
    $objWriter->save('document.docx');
    
    // Скачиваем файл
    $fileName = 'Документ на выдачу ' . $docNumber . '.docx';
    header("Content-Disposition: attachment; filename=" . $fileName);
    readfile('document.docx');
    unlink('document.docx'); // Удаляем файл с сервера
}
?>
