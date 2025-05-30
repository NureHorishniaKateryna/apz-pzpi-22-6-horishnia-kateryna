using System;
using System.Linq;

interface ISortStrategy { void Sort(int[] array); }

class BubbleSort : ISortStrategy {
    public void Sort(int[] array) {
        for (int i = 0; i < array.Length - 1; i++)
            for (int j = 0; j < array.Length - i - 1; j++)
                if (array[j] > array[j + 1]) {
                    var t = array[j]; 
                    array[j] = array[j + 1];     
                    array[j + 1] = t;
                }
        Console.WriteLine("Bubble: " + string.Join(", ", array));
    }
}

class QuickSort : ISortStrategy {
    public void Sort(int[] array) {
        Array.Sort(array);
        Console.WriteLine("Quick: " + string.Join(", ", array));
    }
}

class Sorter {
    private ISortStrategy strategy;
    public void SetStrategy(ISortStrategy s) => strategy = s;
    public void Sort(int[] array) => strategy.Sort(array);
}

class Program {
    static void Main() {
        var sorter = new Sorter();
        var small = new[] { 5, 3, 1, 4, 2 };
        var big = Enumerable.Range(1, 1000).Reverse().ToArray();

        sorter.SetStrategy(new BubbleSort());
        sorter.Sort((int[])small.Clone());

        sorter.SetStrategy(new QuickSort());
        sorter.Sort((int[])big.Clone());
    }
}



interface IPaymentStrategy {
    void Pay(decimal amount);
}

class CreditCardPayment : IPaymentStrategy {
    public void Pay(decimal amount) {
        Console.WriteLine($"Paid {amount} with Credit Card.");
    }
}

class PayPalPayment : IPaymentStrategy {
    public void Pay(decimal amount) {
        Console.WriteLine($"Paid {amount} via PayPal.");
    }
}

class PaymentProcessor {
    private IPaymentStrategy _strategy;

    public void SetStrategy(IPaymentStrategy strategy) {
        _strategy = strategy;
    }

    public void ProcessPayment(decimal amount) {
        _strategy.Pay(amount);
    }
}

class Program {
    static void Main() {
        var processor = new PaymentProcessor();

        processor.SetStrategy(new CreditCardPayment());
        processor.ProcessPayment(100);

        processor.SetStrategy(new PayPalPayment());
        processor.ProcessPayment(50);
    }
}



interface IBehavior {
    void Act();
}

class AggressiveBehavior : IBehavior {
    public void Act() {
        Console.WriteLine("Attacks the enemy aggressively.");
    }
}

class DefensiveBehavior : IBehavior {
    public void Act() {
        Console.WriteLine("Holds position and defends.");
    }
}

class NPC {
    private IBehavior _behavior;

    public void SetBehavior(IBehavior behavior) {
        _behavior = behavior;
    }

    public void PerformAction() {
        _behavior.Act();
    }
}

class Program {
    static void Main() {
        var enemy = new NPC();

        enemy.SetBehavior(new AggressiveBehavior());
        enemy.PerformAction();

        enemy.SetBehavior(new DefensiveBehavior());
        enemy.PerformAction();
    }
}



interface IRecommendationStrategy {
    void Recommend(string user);
}

class CollaborativeFiltering : IRecommendationStrategy {
    public void Recommend(string user) {
        Console.WriteLine($"{user}: collaborative recommendations");
    }
}

class ContentFiltering : IRecommendationStrategy {
    public void Recommend(string user) {
        Console.WriteLine($"{user}: content-based recommendations");
    }
}

class RecommenderSystem {
    private IRecommendationStrategy _strategy;

    public void SetStrategy(IRecommendationStrategy strategy) {
        _strategy = strategy;
    }

    public void RecommendFor(string user) {
        _strategy.Recommend(user);
    }
}

class Program {
    static void Main() {
        var system = new RecommenderSystem();

        system.SetStrategy(new CollaborativeFiltering());
        system.RecommendFor("Alice");

        system.SetStrategy(new ContentFiltering());
        system.RecommendFor("Bob");
    }
}
